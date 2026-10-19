const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, relative);
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = module.paths;
  compiled.require = (name) =>
    Object.hasOwn(overrides, name) ? overrides[name] : require(name);
  compiled._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
  return compiled.exports;
}
const navigation = load("../src/lib/navigation.ts");
const defaults = navigation.navigationVisibilitySchema.parse({});
const pages = [
  { slug: "home", status: "Published", sections: [] },
  { slug: "about", status: "Published", sections: [] },
  { slug: "services", status: "Published", sections: [] },
  { slug: "faq", status: "Published", sections: [] },
  { slug: "bulletin", status: "Draft", sections: [] },
  { slug: "contact", status: "Published", sections: [] },
];

test("draft pages never appear in navigation; individual switches hide published pages independently", () => {
  const published = pages
    .filter((page) => page.status === "Published")
    .map((page) => page.slug);
  assert.equal(
    navigation.visibleNavigation(published, defaults).includes("bulletin"),
    false,
  );
  const hidden = navigation.visibleNavigation(published, {
    ...defaults,
    about: false,
    properties: false,
    contact: false,
  });
  assert.equal(hidden.includes("about"), false);
  assert.equal(hidden.includes("properties"), false);
  assert.equal(hidden.includes("contact"), false);
  assert.equal(hidden.includes("story"), true);
  assert.equal(
    navigation
      .visibleNavigation(
        published.filter((slug) => slug !== "about"),
        defaults,
      )
      .includes("story"),
    false,
  );
  assert.equal(
    navigation
      .visibleNavigation([...published, "bulletin"], defaults)
      .includes("bulletin"),
    true,
  );
});

test("navigation visibility round-trips through existing CMS storage and combines with publication status", async () => {
  const { PostgrestClient } = require("@supabase/postgrest-js");
  let stored;
  const client = new PostgrestClient("https://example.supabase.co/rest/v1", {
    fetch: async (url, init) => {
      const parsed = new URL(url);
      const method = init.method;
      let result;
      if (parsed.pathname.endsWith("/content_sections")) {
        stored = JSON.parse(init.body).content;
        result = [];
      } else if (method === "POST") {
        assert.equal(
          JSON.parse(init.body).slug,
          navigation.navigationSettingsSlug,
        );
        result = { id: "navigation-id" };
      } else if (parsed.searchParams.has("slug")) {
        result = stored
          ? {
              content_sections: [
                { section_key: "visibility", content: stored },
              ],
            }
          : null;
      } else {
        assert.equal(parsed.searchParams.get("status"), "eq.published");
        result = pages.filter((page) => page.status === "Published");
      }
      return Response.json(result);
    },
  });
  const repository = load("../src/lib/navigation-repository.ts", {
    "server-only": {},
    "@/lib/admin-mock-data": { adminContentPages: pages },
    "@/lib/env": { hasSupabaseEnv: () => true },
    "@/lib/navigation": navigation,
    "@/lib/supabase/server": { createClient: async () => client },
  });
  assert.equal(
    (await repository.getPublicNavigation()).includes("bulletin"),
    false,
  );
  await repository.saveNavigationVisibility({ ...defaults, faq: false });
  assert.equal((await repository.getNavigationVisibility()).faq, false);
  assert.equal((await repository.getPublicNavigation()).includes("faq"), false);
  assert.equal(
    (await repository.getPublicNavigation()).includes("about"),
    true,
  );
  await repository.saveNavigationVisibility(defaults);
  assert.equal((await repository.getPublicNavigation()).includes("faq"), true);
  const bulletin = pages.find((page) => page.slug === "bulletin");
  bulletin.status = "Published";
  assert.equal(
    (await repository.getPublicNavigation()).includes("bulletin"),
    true,
  );
  bulletin.status = "Draft";
  assert.equal(
    (await repository.getPublicNavigation()).includes("bulletin"),
    false,
  );
});

test("fallback content and navigation respect drafts, including direct Bulletin content lookup", async () => {
  const repository = load("../src/lib/content-repository.ts", {
    "server-only": {},
    "@/lib/admin-mock-data": { adminContentPages: pages },
    "@/lib/env": { hasSupabaseEnv: () => false },
    "@/lib/listing-schema": {},
    "@/lib/local-areas": {},
    "@/lib/navigation": navigation,
    "@/lib/supabase/server": {},
  });
  assert.equal(await repository.getContentPage("bulletin"), null);
  assert.equal(
    (await repository.getContentPage("bulletin", true)).status,
    "draft",
  );
  assert.equal(
    (await repository.listContentPages()).some(
      (page) => page.slug === "bulletin",
    ),
    false,
  );
  assert.equal(
    (await repository.listContentPages(true)).some(
      (page) => page.slug === "bulletin",
    ),
    true,
  );
  assert.equal(
    await repository.getContentPage(navigation.navigationSettingsSlug, true),
    null,
  );
});

test("navigation updates require admin access and reject incomplete settings without writing", async () => {
  let admin = null;
  let saved;
  const paths = [];
  const route = load("../src/app/api/admin/navigation/route.ts", {
    "next/cache": { revalidatePath: (...args) => paths.push(args) },
    "@/lib/auth": { getAdminUser: async () => admin },
    "@/lib/navigation": navigation,
    "@/lib/navigation-repository": {
      saveNavigationVisibility: async (data) => {
        saved = data;
        return data;
      },
    },
  });
  const request = (data) =>
    new Request("http://localhost/api/admin/navigation", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  assert.equal((await route.PATCH(request(defaults))).status, 401);
  admin = { id: "admin-id" };
  assert.equal((await route.PATCH(request({}))).status, 400);
  assert.equal(saved, undefined);
  assert.equal(
    (await route.PATCH(request({ ...defaults, bulletin: false }))).status,
    200,
  );
  assert.equal(saved.bulletin, false);
  assert.deepEqual(paths, [["/", "layout"]]);
});

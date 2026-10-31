import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { extract } from "tar";

const REGISTRY = "https://registry.npmjs.org";
const DIST = path.resolve("build");
const TMP = await fs.mkdtemp(path.join(os.tmpdir(), "scramjet-"));

async function getPkg(name, version = "latest") {
  const res = await fetch(`${REGISTRY}/${name}`);
  const data = await res.json();

  if (version !== "latest" && !version.includes(".")) {
    version = Object.keys(data.versions)
      .filter((v) => v.startsWith(`${version}.`))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
  } else if (version === "latest") {
    version = data["dist-tags"].latest;
  }

  return data.versions[version];
}

async function download(url, name) {
  const res = await fetch(url);
  const tgz = path.join(TMP, `${name}.tgz`);
  const dest = path.join(TMP, name);

  await fs.writeFile(tgz, Buffer.from(await res.arrayBuffer()));
  await fs.mkdir(dest, { recursive: true });
  await extract({ f: tgz, cwd: dest });

  return path.join(dest, "package/dist");
}

try {
  const controller = await getPkg("@mercuryworkshop/scramjet-controller", "0");
  const scramjetVer = controller.devDependencies["@mercuryworkshop/scramjet"];

  const [scramjet, utils] = await Promise.all([
    getPkg("@mercuryworkshop/scramjet", scramjetVer),
    getPkg("@mercuryworkshop/scramjet-utils", "0"),
  ]);

  const [scramjetDir, controllerDir, utilsDir] = await Promise.all([
    download(scramjet.dist.tarball, "scramjet"),
    download(controller.dist.tarball, "controller"),
    download(utils.dist.tarball, "utils"),
  ]);

  const files = {
    "scramjet/scramjet.js": `${scramjetDir}/scramjet.js`,
    "scramjet/scramjet.wasm": `${scramjetDir}/scramjet.wasm`,
    "scramjet/scramjet-utils.js": `${utilsDir}/scramjet-utils.js`,
    "controller/controller.api.js": `${controllerDir}/controller.api.js`,
    "controller/controller.sw.js": `${controllerDir}/controller.sw.js`,
    "controller/controller.inject.js": `${controllerDir}/controller.inject.js`,
  };

  for (const [out, src] of Object.entries(files)) {
    const target = path.join(DIST, out);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(src, target);
  }
} finally {
  await fs.rm(TMP, { recursive: true, force: true });
}

// --jsx JSX support is provided using another plugin. If you want your output to contains JSX code (i.e. --jsx preserve), you need the @babel/plugin-syntax-jsx plugin; if you want to transpile it to standard JavaScript (i.e. --jsx react or --jsx react-native), you should use the @babel/plugin-transform-react-jsx plugin.

// Note: Quick and dirty
// ./node_modules/.bin/babel . --ignore node_modules --ignore types -d lib-pages --extensions ".ts,.tsx" --presets=@babel/preset-react --presets @babel/preset-typescript
import { babel, getBabelOutputPlugin } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import json from "@rollup/plugin-json";

import { readdir } from "node:fs/promises";
import { join } from "node:path";

const walk = async (dirPath) =>
  Promise.all(
    await readdir(dirPath, { withFileTypes: true }).then((entries) =>
      entries.map((entry) => {
        const childPath = join(dirPath, entry.name);
        return entry.isDirectory() ? walk(childPath) : childPath;
      })
    )
  );

const allFiles = await Promise.all(
  ["components", "contexts", "e2e", "hooks", "pages", "styles", "utils"].map(
    walk
  )
);
// const allFilesJs = allFiles
//   .flat(Number.POSITIVE_INFINITY)
//   .filter(
//     (name) =>
//       !name.startsWith("node_modules") ||
//       name.endsWith(".ts") ||
//       name.endsWith(".tsx")
//   );

//console.log(allFiles);
const config = {
  // acornInjectPlugins: [jsx()],
  input: Object.fromEntries(
    allFiles
      .flat(Number.POSITIVE_INFINITY)
      .filter((name) => !name.endsWith(".json") || name.endsWith(".d.ts"))
      .map((name) => [name.slice(0, name.lastIndexOf(".")), name])
  ),
  output: {
    dir: "output",
    format: "es",
  },
  external: [/node_modules/],
  plugins: [
    //typescript(),
    json(),
    resolve({
      extensions: [".js", ".ts", ".tsx", ".jsx", ".json"],
    }),
    commonjs(),
    sucrase({
      exclude: ["node_modules/**"],
      transforms: ["typescript", "jsx"],
    }),
  ],
};
export default [config];

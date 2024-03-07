const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["index.jsx"],
    bundle: true,
    platform: "node",
    target: ["node14"], // Adjust based on your Node.js version
    outfile: "dist/index.mjs",
    format: "esm", // Output as ES module
    external: ["ink", "react"], // Add other external dependencies as needed
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  })
  .catch(() => process.exit(1));

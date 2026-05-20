[phases.setup]
nixPkgs = ["nodejs_20", "pkg-config", "cairo", "pango", "libpng", "jpeg", "giflib", "librsvg"]

[phases.install]
cmds = ["npm ci --omit=dev=false"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"

import esbuild from "esbuild";

const bundleCode = async (code) => {
    const result = await esbuild.build({
        stdin: {
            contents: code,
            resolveDir: "",
            sourcefile: "userFunc.js",
        },
        bundle: true,
        platform: "node",
        target: "node18",
        format: "cjs",
        write: false,
        minify: true,
    });

    return result.outputFiles[0].text;
}

export default bundleCode;

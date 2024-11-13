// rollup.config.js
const typescript = require("@rollup/plugin-typescript");
import babel from '@rollup/plugin-babel';
import { uglify } from "rollup-plugin-uglify";

export default {
  input: "./src/index.ts",
  output: {
    file: "./dist/bundle.js", // 출력 경로
    format: "es", // 출력 형식
    sourcemap: true, // 소스 맵을 켜놔서 디버깅을 쉽게 만들자
  },
  plugins: [
        // 바벨 트랜스파일러 설정
        babel({
            babelHelpers: 'bundled',
            presets: [
            //   '@babel/preset-env',
            //   '@babel/preset-typescript',
            ],
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
          }),
    // 타입스크립트
    typescript(),
    // uglify()
  ],
};

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      'react/self-closing-comp': [
        'warn',
        {
          component: true, // 对组件启用自闭合规则
          html: true, // 对 HTML 标签启用自闭合规则
        },
      ],
    },
  }

];

export default eslintConfig;

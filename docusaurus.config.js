const lightCodeTheme = require("prism-react-renderer").themes.github;
const darkCodeTheme = require("prism-react-renderer").themes.dracula;

export default {
  title: "Nodemailer 中文文档",
  tagline: "✉️ 使用 Node.js 发送电子邮件——轻松如蛋糕！",
  favicon: "img/favicon.ico",
  url: "https://nodemailer.zhcndoc.com",
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "nodemailer", // Usually your GitHub org/user name.
  projectName: "nodemailer-homepage", // Usually your repo name.

  deploymentBranch: "master",

  trailingSlash: false,

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN"],
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: { path: "docs", routeBasePath: "/", sidebarPath: "sidebars.js" },
        blog: false,
        pages: false,
      },
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            to: "/",
            from: ["/about"],
          },
        ],
      },
    ],
  ],

  scripts: [
    // {
    //   src: "https://plausible.emailengine.dev/js/script.js",
    //   defer: true,
    // },
    {
      src: 'https://www.zhcndoc.com/js/common.js',
      async: true,
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/social-card.png",
    navbar: {
      title: "Nodemailer",
      logo: {
        alt: "Nodemailer",
        src: "img/nm_logo_200x136.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "文档",
        },
        {
          href: "https://emailengine.app/?utm_source=nodemailer&utm_campaign=nodemailer&utm_medium=navbar",
          position: "left",
          label: "EmailEngine",
        },
        {
          href: "https://www.zhcndoc.com",
          position: "left",
          label: "简中文档",
        },
        {
          href: "https://www.npmjs.com/package/nodemailer",
          label: "NPM",
          position: "right",
        },
        {
          href: "https://github.com/nodemailer/nodemailer",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",

      copyright: `<a target="_blank" style="text-decoration: none;" href="https://www.zhcndoc.com">简中文档</a>｜<a rel="nofollow" target="_blank" style="text-decoration: none;" href="https://beian.miit.gov.cn">沪ICP备2024070610号-3</a>`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ["php"],
    },
    defaultMode: "light",
    disableSwitch: false,
    respectPrefersColorScheme: false,

    mermaid: {
      theme: { light: "default", dark: "dark" },
    },

    algolia: {
      // The application ID provided by Algolia
      appId: "BNTKMOXVM6",

      // Public API key: it is safe to commit it
      apiKey: "8b9aa4293a38493456a7797f8f1c3a82",

      indexName: "nodemailer",

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: "search",

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: true,

      //... other Algolia params
    },
  },
};

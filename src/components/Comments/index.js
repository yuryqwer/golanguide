import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function GiscusComments() {
    // 如果未配置Giscus配置项，则不渲染
    // (配置项将从docusaurus.config.js中获取，见下一步)

    return (
        // BrowserOnly确保组件只在客户端渲染，避免服务端渲染(SSR)不匹配问题
        <BrowserOnly fallback={<div>加载评论中...</div>}>
            {() => {
                // 必须在BrowserOnly的children函数内使用客户端特有的Hook
                const { colorMode } = useColorMode();

                // 核心逻辑：根据当前颜色模式映射Giscus主题
                // 这里使用'dark_dimmed'作为暗色主题，你也可以选择'dark'或'transparent_dark'
                const giscusTheme = colorMode === 'dark' ? 'dark_dimmed' : 'light';

                // 从docusaurus配置中读取Giscus参数 (将在步骤二中定义)
                // 注意：需要先安装并导入useDocusaurusContext
                // const { siteConfig } = require('@docusaurus/useDocusaurusContext').default;
                // const giscusConfig = siteConfig.themeConfig?.giscus;
                
                const { siteConfig } = useDocusaurusContext();
                const giscusConfig = siteConfig.themeConfig?.giscus;
                if (!giscusConfig?.repo) {
                    return null; // 未配置则不渲染
                }

                return (
                    <Giscus
                        id="comments"
                        repo={giscusConfig.repo}
                        repoId={giscusConfig.repoId}
                        category={giscusConfig.category}
                        categoryId={giscusConfig.categoryId}
                        mapping="pathname" // 以路径作为文章标识
                        strict="0"
                        reactionsEnabled="1"
                        emitMetadata="0"
                        inputPosition="top"
                        theme={giscusTheme} // <-- 动态主题变量在此传入
                        lang="zh-CN"
                        loading="lazy"
                    />
                );
            }}
        </BrowserOnly>
    );
}
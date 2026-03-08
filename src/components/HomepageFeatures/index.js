import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '详尽的面试主题',
    Svg: require('@site/static/img/undraw_gopher_mountain.svg').default,
    description: (
      <>
        包含缓存、数据库、消息队列、高并发、高可用等后端常见题目，帮助你系统复习
        Go 语言关键知识点。
      </>
    ),
  },
  {
    title: '实战题库与解析',
    Svg: require('@site/static/img/undraw_gopher_tree.svg').default,
    description: (
      <>
        提供真实面试题案例及详细解析，让你在模拟环境中提升答题能力与思路。
      </>
    ),
  },
  {
    title: '经典项目与练习',
    Svg: require('@site/static/img/undraw_gopher_gopher.svg').default,
    description: (
      <>
        通过示例项目和练手题目，动手练习 Go 后端开发，强化技能并紧贴行业需求。
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

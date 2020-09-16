import Layout from "./Layout"
import styles from "../src/css/components/defaultlayout.module.scss"

export default function DefaultLayout(props){
    return <Layout className={styles.topLevel}>
        {props.children}
    </Layout>
}

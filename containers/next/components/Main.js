import styles from "../src/css/components/main.module.scss"

export default function Main(props){
    return <main className={styles.topLevel}>
        <div>
            {props.children}
        </div>
    </main>
}

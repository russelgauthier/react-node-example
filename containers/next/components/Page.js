import Html from "./Html"

export default function Page(props){
    return <Html title={props.title} metas={props.metas}>
        {props.children}
    </Html>
}

import Head from 'next/head'

export default function Html(props){
    function metarecurse(objs, prefix = ''){
        let results = []

        for(let key in objs){
            if(typeof (objs[key]) !== "object" || typeof (objs[key]) === 'object' && objs[key].length !== undefined){
                results.push(<meta name={prefix.length ? `${prefix}:${key}` : key}
                                   key={prefix.length ? `${prefix}:${key}` : key} content={objs[key]}/>)
            } else {
                results = [...results, ...metarecurse(objs[key], prefix.length ? `${prefix}:${key}` : key)]
            }
        }

        return results
    }

    return <>
        <Head>
            {props.title && <title>{props.title}</title>}
            {props.metas && metarecurse(props.metas)}
        </Head>
        {props.children}
    </>
}

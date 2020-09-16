import Page from './Page'
import Head from "next/head"

export default function DefaultPage(props){
    let metasDefault = {
        description: 'This is my description',
        keywords: ['cool', 'page', 'nextjs'],
        author: 'Russel Gauthier',
        og: {
            title: 'My Og title',
            image: {
                type: 'image/jpeg'
            }
        },
        twitter: {
            card: 'TestTwitterCard',
            url: 'google.com'
        }
    }

    let metas = {
        ...props.metas,
        ...metasDefault
    }

    if(metasDefault.keywords && props.metas?.keywords){
        metas.keywords = [...props.metas.keywords, ...metasDefault.keywords.filter(keyword => props.metas.keywords.findIndex(x => x === keyword) === -1)]
    }

    return <Page title={props.title} metas={metas}>
        <Head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/picturefill/3.0.3/picturefill.min.js"
                    integrity="sha256-iT+n/otuaeKCgxnASny7bxKeqCDbaV1M7VdX1ZRQtqg=" crossOrigin="anonymous"></script>
            <link rel="stylesheet" href="https://use.typekit.net/oyn8pqj.css"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/4.4.3/antd.min.css"
                  integrity="sha512-BrhnOVCdh2C9uHmOCJXGN9tgW6rOoiKtHDJqeKu06XzNPtGf6jMC7ajEj3EtBdiHovsgh724EjzPgm2dqOmobw=="
                  crossOrigin="anonymous"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"
                /*integrity="sha256-l85OmPOjvil/SOvVt3HnSSjzF1TUMyT9eV0c2BzEGzU="*/ crossOrigin="anonymous"/>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
                  rel="stylesheet"/>
            <script src="https://apis.google.com/js/platform.js" async defer></script>
            <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>

            {/*Resetting initial scale for mobile*/}
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
        </Head>
        {props.children}
    </Page>
}

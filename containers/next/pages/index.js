import DefaultLayout from "../components/DefaultLayout"
import DefaultPage from "../components/DefaultPage"

import fetch from 'isomorphic-fetch'
import NavBar from "../components/NavBar";
import Main from "../components/Main";
import Bike from "../components/Bike";

import {useEffect, useState} from "react"

export default function Index(props){
    const [sortableIndex, setSortableIndex] = useState("name")
    const [sortableDirection, setSortableDirection] = useState("desc")

    const [bikes, setBikes] = useState([])

    let sortBikes = bikes => {
        if(sortableIndex === "name"){
            bikes = bikes.sort(function(a, b){
                if(b.name < a.name){
                    return sortableDirection === "desc" ? 1 : -1
                } else if(b.name > a.name){
                    return sortableDirection === "desc" ? -1 : 1
                } else {
                    return 0
                }
            })
        } else if(sortableIndex === "num_bikes_available"){
            bikes = bikes.sort((a, b) => {
                if(sortableDirection === "desc"){
                    return b?.num_bikes_available - a?.num_bikes_available
                } else {
                    return a?.num_bikes_available - b?.num_bikes_available
                }
            })
        }

        return bikes
    }
    let getDataAndSort = () => {
        let fetchURL = sortableIndex === "name" ? `https://toronto-us.publicbikesystem.net/ube/gbfs/v1/en/station_information` : `https://toronto-us.publicbikesystem.net/ube/gbfs/v1/en/station_status`

        fetch(fetchURL)
            .then(res => res.json())
            .then(data => {
                setBikes(sortBikes(data.data?.stations || [], sortableIndex))
            })
    }

    useEffect(() => {
        getDataAndSort()
    }, [])

    useEffect(() => {
        getDataAndSort()
    }, [sortableIndex, sortableDirection])

    return <DefaultPage title={"Bike Stations"} metas={{keywords: ["bikes", "stations"], description: 'List of all stations, sortable by name or number of bike stations available'}}>
        <DefaultLayout>
            <NavBar setSortedIndex={setSortableIndex} sortableIndex={sortableIndex} sortableDirection={sortableDirection} setSortableDirection={setSortableDirection}/>
            <Main>
                <ol>
                    {bikes.map(bike => <li key={bike.station_id}>
                        <Bike {...bike} />
                    </li>
                )}
                </ol>
            </Main>
        </DefaultLayout>
    </DefaultPage>
}

export async function getServerSideProps(ctx){
    try {

        return {
            props: {}
        }
    } catch (e){
        return {
            props: {error: {message: `Issue loading data: ${e}`}}
        }
    }
}

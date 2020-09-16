import styles from "../src/css/components/bike.module.scss"

export default function Bike(props){
    return <div className={styles.topLevel}>
        <div className={styles.title}>
            <label>StationId:</label> {props.station_id}
            {props.name && <> — {props.name}</>}
        </div>
        <div className={styles.detailsConfig}>
            {props.physical_configuration && <div>
                <label>Configuration:</label> {props.physical_configuration.toLocaleLowerCase()}
            </div>}

            {props.rental_methods && <div>
                <label>Rental Methods:</label> {props.rental_methods.map(rental_method => rental_method.toLocaleLowerCase()).join(" ")}
            </div>}
        </div>
        <div className={styles.status}>
            {props.num_bikes_available >= 0 && <div>
                <label>Available:</label> {props.num_bikes_available}
            </div>}

            {props.is_charging_station === true && <div>
                <label>Charging Station</label>
            </div>}

            {props.status && <div>
                <label>Status:</label> {props.status.toLocaleLowerCase().replace("_", " ")}
            </div>}
        </div>
    </div>
}

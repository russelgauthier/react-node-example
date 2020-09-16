import {Select} from 'antd'
const {Option} = Select

import Logo from "./../src/svg/logo.svg"

import styles from "../src/css/components/navbar.module.scss"

export default function NavBar(props){
    return <nav className={styles.topLevel}>
        <ol>
            <li><Logo/></li>
            <li>
                <label className={styles.sortingLabel}>Sort by: </label>
                <Select defaultValue="name" style={{ width: 170 }} value={props.sortableIndex} onChange={value => props.setSortedIndex(value)}>
                    <Option value="name">Name</Option>
                    <Option value="num_bikes_available">Available Bicycles</Option>
                </Select>
                <Select defaultValue="desc" style={{ width: 170 }} value={props.sortableDirection} onChange={value => props.setSortableDirection(value)} >
                    <Option value="desc">Descending</Option>
                    <Option value="asc">Ascending</Option>
                </Select>
            </li>
        </ol>
    </nav>
}

import StockChart from "./StockChart";

const Home = () => {

    return (
        <section className="main-section">
            <h1 style = {{textAlign: "center", fontSize: '60px'}}>Stock Market Data Analysis</h1>
            <StockChart />
        </section>
    )
}

export default Home
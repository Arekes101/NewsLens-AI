import { useEffect } from "react";
import { getNews } from "../services/newsApi";

const Home = () => {

    useEffect(() => {

        const fetchNews = async () => {
            const data = await getNews();
            console.log(data);
        }

        fetchNews();

    }, []);

    return (
        <div>
            Home
        </div>
    );
}

export default Home;
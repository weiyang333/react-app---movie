/*import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const  Card = ({title}) => {
    const [count,setCount]  = useState(0)
    const [hasLiked,setHasLiked] = useState(false)
    useEffect(() => {
        console.log(`${title} has liked ${hasLiked}`)
    })
    return (
        <div className="card" onClick={ () => setCount(count+1) }>
            <h2>{title} - {count}</h2>
            <button onClick={() => setHasLiked(!hasLiked)}>
                {hasLiked ? '❤' : '🤍'}
            </button>
        </div>
    )
}

const App = () => {
    return (
        <div className="card-container">

            <Card  title="Start Wars" />
            <Card  title="End Wars" />
            <Card title="Start Wars" />
        </div>
    )
}

export default App*/

// API应用程序编程接口，他只是一组规则，他允许一个软件应用程序（本案例中为react）与另外一个软件
// 应用程序（设置在其他地方的服务器或则数据库）进行通信，本案例中我们使用TMDB的API来获取数据

/*
* API过载可能会耗尽服务器资源
* 速率限制，API可能有太多的请求规则，可能会破坏应用程序或导致节流
* */

import React from 'react';
import Search from "./components/Search.jsx";
import {useEffect, useState} from "react";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS= {
    method: 'GET',
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // 优化搜索，构建一个优化的搜索方案，通过对搜索的字段进行防抖处理来提高性能
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500,[searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
                `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint,API_OPTIONS);
            if (!response.ok) {
                throw new Error("Could not fetch movies");
            }
            const data = await response.json();
            console.log(data);
            if (data.response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList(null)
                return;
            }
            setMovieList(data.results || []);

            if (query && data.results.length > 0) {
               await updateSearchCount(query,data.results[0]);

            }

        } catch(error) {
            console.log(`Error fetching movies:${error}`);
            setErrorMessage('Error fetching movies.Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies()
            setTrendingMovies(movies)
        }catch(error) {
            console.log(`Error fetching movies:${error}`);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm)
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies()
    },[])

    return (
        <main>
           <div className="pattern" />
            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1>Find <span className="text-gradient">Movies</span>
                        You'll Enjoy Without the Hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>
                <section className="all-movies">
                    {
                        trendingMovies.length > 0 && (
                            <section className="trending">
                                <h2>Trending Movies</h2>
                                <ul>
                                    {trendingMovies.map((movie,index) => (
                                        <li key={movie.$id}>
                                            <p>{index + 1}</p>
                                            <img src={movie.poster_url} alt={movie.title} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )
                    }
                    <h2 >All Movies</h2>
                    {/*{errorMessage && <p className="text-red-500">{errorMessage}</p>}*/}

                    {isLoading ? (
                        // <p className="text-white">Loading...</p>
                        <Spinner />
                    ):errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ):(
                        <ul>
                            {movieList.map((movie) => (
                               <MovieCard key={movie.id} movie={movie} />

                            ))}
                        </ul>
                    )}
                </section>
            </div>

        </main>
    );
};

export default App;
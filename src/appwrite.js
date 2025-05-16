import {Databases, Query,ID,Client} from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)
const database = new Databases(client)

export const updateSearchCount = async (searchTerm,movie) => {
    // console.log(PROJECT_ID,DATABASE_ID,COLLECTION_ID);
//    1.检查数据库是否存在文档或则搜索词
    try {
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,
            [Query.equal('searchTerm', searchTerm)])
//     2.如果存在则更新计数
        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID,COLLECTION_ID,doc.$id,{
                count:doc.count + 1
            })
//     3.如果不存在，则创建一个带有搜索词和计数的文档，并将计数设置为1
        }else {
            await database.createDocument(DATABASE_ID,COLLECTION_ID,ID.unique(),{
                searchTerm,
                count:1,
                movie_id:movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            })

        }

    }catch (error) {
        console.log(error);
    }
}

export const getTrendingMovies = async movieId => {
    try {
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.limit(4),
            Query.orderDesc("count")
        ])
        return result.documents;
    }catch(error) {
        console.log(error);
    }
}
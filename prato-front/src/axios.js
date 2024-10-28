import Axios from "axios";


const axios = Axios.create({
    baseURL: "https://pratoderacao-back.onrender.com",
    headers: { Auth: 'Simple AUTH'},
    timeout: 50000
})

export default axios
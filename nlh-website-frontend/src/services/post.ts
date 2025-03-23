import axios from 'axios'
const baseUrl = 'http://localhost:3001/api/blog'

const getAll = () => {
    const req = axios.get(baseUrl)
    return req.then(res => res.data)
}

const create = (newObject: any) => {
    const req =  axios.post(baseUrl, newObject)
    return req.then(res => res.data)
}

const update = (id: number, newObject: any) => {
    const req =  axios.put(`${baseUrl}/${id}`, newObject)
    return req.then(res => res.data)
}

const del = (id: number) => {
    const req = axios.delete(`${baseUrl}/${id}`)
    return req.then(res => res.data)
}

export default { getAll, create, update , del }
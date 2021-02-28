const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF8iOiJiNDFlYzVkYWQ3ZDU0MzU3ODgzYyIsImlhdCI6MTYwMjQ4NzIzNH0.Hk-TNkZFDgNv3TyyTJpOa_4AbxSoYbRRpmeIQCkMV9A"
const option = {
    transportOptions: {
        polling: {
            extraHeaders: {
                'authorization': `Bearer ${token}`,
            }
        }
    },
    query: {
        "test": 'test'
    }
}

const IO = (path = '/') => {
    return io(path, option)
}

const socket = IO();

const main = () => {
    // socket.on('error', err => console.log(err))
    // socket.on('view-jobs', jobs => console.log(jobs))
    // socket.emit("get-apply", { job_id: "906643fa33e54ef8bfa8" }).on('view-apply', data => console.log(data))
    // socket.emit('foo')
}
// main()

// document.getElementById("upload").addEventListener('submit', e => {
//     e.preventDefault()

//     const file = e.target.filename.value
//     socket.emit('foo', file)

// })
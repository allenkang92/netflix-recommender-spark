fetch("/")
.then(response => response.json())
.then(data => {
    // Handle the response data here
})
.catch(error => {
    // Handle any errors that occur during the fetch request
});
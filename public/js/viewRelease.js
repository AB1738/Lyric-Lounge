const reviews=document.querySelectorAll('#review')

const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
        entry.target.classList.toggle('show',entry.isIntersecting)
    })
    console.log(entries)
},{
    threshold:.5
})

reviews.forEach(review=>{
    observer.observe(review)
})


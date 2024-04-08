const reviewBtn=document.querySelector('#review-btn')
const reviewForm=document.querySelector('#review-form')
reviewBtn.addEventListener('click',()=>{
   console.log('clicked')
   reviewForm.style.display='block'
   reviewBtn.style.display='none'
})
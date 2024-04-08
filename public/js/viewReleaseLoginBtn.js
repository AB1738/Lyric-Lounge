const reviewBtn=document.querySelector('#review-btn')
const reviewForm=document.querySelector('#review-form')
reviewBtn.addEventListener('click',()=>{
   reviewForm.style.display='block'
   reviewBtn.style.display='none'
})
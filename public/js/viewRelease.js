 const editReview=()=>{
    const review=document.querySelectorAll('#review')
    const editBtn=document.querySelectorAll('#edit-review')
    const deleteBtn=document.querySelectorAll('#delete-review')
    const rating=document.querySelectorAll('#review-rating')
    const comment=document.querySelectorAll('#review-comment')
    const editForm=document.querySelectorAll('#edit-form')
    for(let i=0;i<review.length;i++){
        editBtn[i].addEventListener('click',(e)=>{
            e.preventDefault()
            const newRating=document.createElement('input')
            const ratingLabel=document.createElement('label')
            ratingLabel.setAttribute('for','rating')
            ratingLabel.textContent='Rating:'
            newRating.setAttribute("type","range")
            newRating.setAttribute("name","rating")
            newRating.setAttribute("id","rating")
            rating[i].replaceWith(newRating)
            const input=document.createElement('textarea')
            const inputLabel=document.createElement('label')
            inputLabel.setAttribute('for','comment')
            inputLabel.textContent="Review:"
            input.setAttribute("name","comment")
            input.setAttribute("id","comment")
            input.setAttribute("rows","5")
            input.setAttribute("cols","33")
            comment[i].replaceWith(input)
            editBtn[i].style.display='none'
            deleteBtn[i].style.display='none'
            const submitBtn=document.createElement('button')
            submitBtn.classList.add('btn')
            submitBtn.classList.add('btn-success')
            submitBtn.classList.add('mr-auto')
            submitBtn.textContent='Post'

            editForm[i].insertBefore(ratingLabel,editForm[i].children[0])
            editForm[i].insertBefore(inputLabel,editForm[i].children[2])
            
            editForm[i].append(submitBtn)
           
            
        })
    }

 }
 editReview()


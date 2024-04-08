


 
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

            const fieldset=document.createElement('fieldset')
            fieldset.classList.add('starability-growRotate')
            const legend=document.createElement('legend')
            legend.textContent='Rating: '
            const fieldsetInput1=document.createElement('input')
            fieldsetInput1.classList.add('input-no-rate')
            fieldsetInput1.setAttribute('type','radio')
            fieldsetInput1.setAttribute('id','no-rate')
            fieldsetInput1.setAttribute('name','rating')
            fieldsetInput1.setAttribute('value','0')
            fieldsetInput1.setAttribute('aria-label','no rating')
            fieldsetInput1.setAttribute('checked','true')
            const fieldsetInput2=document.createElement('input')
            fieldsetInput2.setAttribute('type','radio')
            fieldsetInput2.setAttribute('id','first-rate1')
            fieldsetInput2.setAttribute('name','rating')
            fieldsetInput2.setAttribute('value','1')
            const fieldsetLabel1=document.createElement('label')
            fieldsetLabel1.setAttribute('for','first-rate1')
            fieldsetLabel1.setAttribute('title','Terrible')
            fieldsetLabel1.textContent='1 Star'
            const fieldsetInput3=document.createElement('input')
            fieldsetInput3.setAttribute('type','radio')
            fieldsetInput3.setAttribute('id','first-rate2')
            fieldsetInput3.setAttribute('name','rating')
            fieldsetInput3.setAttribute('value','2')
            const fieldsetLabel2=document.createElement('label')
            fieldsetLabel2.setAttribute('for','first-rate2')
            fieldsetLabel2.setAttribute('title','Not good')
            fieldsetLabel2.textContent='2 Stars'
            const fieldsetInput4=document.createElement('input')
            fieldsetInput4.setAttribute('type','radio')
            fieldsetInput4.setAttribute('id','first-rate3')
            fieldsetInput4.setAttribute('name','rating')
            fieldsetInput4.setAttribute('value','3')
            const fieldsetLabel3=document.createElement('label')
            fieldsetLabel3.setAttribute('for','first-rate3')
            fieldsetLabel3.setAttribute('title','Average')
            fieldsetLabel3.textContent='3 Stars'
            const fieldsetInput5=document.createElement('input')
            fieldsetInput5.setAttribute('type','radio')
            fieldsetInput5.setAttribute('id','first-rate4')
            fieldsetInput5.setAttribute('name','rating')
            fieldsetInput5.setAttribute('value','4')
            const fieldsetLabel4=document.createElement('label')
            fieldsetLabel4.setAttribute('for','first-rate4')
            fieldsetLabel4.setAttribute('title','Very good')
            fieldsetLabel4.textContent='4 Stars'
            const fieldsetInput6=document.createElement('input')
            fieldsetInput6.setAttribute('type','radio')
            fieldsetInput6.setAttribute('id','first-rate5')
            fieldsetInput6.setAttribute('name','rating')
            fieldsetInput6.setAttribute('value','5')
            const fieldsetLabel5=document.createElement('label')
            fieldsetLabel5.setAttribute('for','first-rate5')
            fieldsetLabel5.setAttribute('title','Amazing')
            fieldsetLabel5.textContent='5 Stars'
            fieldset.appendChild(legend)
            fieldset.appendChild(fieldsetInput1)
            fieldset.appendChild(fieldsetInput2)
            fieldset.appendChild(fieldsetInput3)
            fieldset.appendChild(fieldsetInput4)
            fieldset.appendChild(fieldsetInput5)
            fieldset.appendChild(fieldsetInput6)
            fieldset.appendChild(fieldsetLabel1)
            fieldset.appendChild(fieldsetLabel2)
            fieldset.appendChild(fieldsetLabel3)
            fieldset.appendChild(fieldsetLabel4)
            fieldset.appendChild(fieldsetLabel5)
            rating[i].replaceWith(fieldset)





            // const newRating=document.createElement('input')
            // const ratingLabel=document.createElement('label')
            // ratingLabel.setAttribute('for','rating')
            // ratingLabel.textContent='Rating:'
            // newRating.setAttribute("type","range")
            // newRating.setAttribute("name","rating")
            // newRating.setAttribute("id","rating")
            // rating[i].replaceWith(newRating)









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
            editForm[i].appendChild(submitBtn)
            editForm[i].insertBefore(ratingLabel,editForm[i].children[1])
            editForm[i].insertBefore(inputLabel,editForm[i].children[2])
            
            
           
            
        })
    }

 }
 editReview()

 
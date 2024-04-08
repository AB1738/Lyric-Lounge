 
 const editReview=()=>{
    const review=document.querySelectorAll('#review')
    const review2=document.querySelectorAll('#review')
    const editBtn=document.querySelectorAll('#edit-review')
    const deleteBtn=document.querySelectorAll('#delete-review')
    const rating=document.querySelectorAll('#review-rating')
    const comment=document.querySelectorAll('#review-comment')
    const editForm=document.querySelectorAll('#edit-form')
    for(let i=0;i<review.length;i++){
        
        editBtn[i].addEventListener('click',(e)=>{
            const firstchild=review2[i+1].innerHTML
            console.log('edit button clicked')
            e.preventDefault()
            const fieldset = document.createElement('fieldset');
                fieldset.classList.add('starability-growRotate');

                const legend = document.createElement('legend');
                legend.textContent = 'First rating:';
                fieldset.appendChild(legend);

                const ratings = [
                { value: 1, title: 'Terrible', labelText: '1 star' },
                { value: 2, title: 'Not good', labelText: '2 stars' },
                { value: 3, title: 'Average', labelText: '3 stars' },
                { value: 4, title: 'Very good', labelText: '4 stars' },
                { value: 5, title: 'Amazing', labelText: '5 stars' }
                ];

                ratings.forEach(rating => {
                const input = document.createElement('input');
                input.type = 'radio';
                input.id = `first-rate${rating.value}`;
                input.name = 'rating';
                input.value = rating.value;
                if (rating.value === 0) input.checked = true;
                input.setAttribute('aria-label', rating.labelText);
                fieldset.appendChild(input);

                const label = document.createElement('label');
                label.htmlFor = `first-rate${rating.value}`;
                label.title = rating.title;
                label.textContent = rating.labelText;
                fieldset.appendChild(label);
                });



         
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
            const cancelBtn=document.createElement('button')
            cancelBtn.classList.add('btn')
            cancelBtn.classList.add('btn-info')
            cancelBtn.textContent='Cancel'
            cancelBtn.removeEventListener('click',()=>{
                console.log('event listener removed')
            })
            cancelBtn.addEventListener('click',()=>{
                // const field=document.querySelectorAll('.starability-growRotate')
                // console.log(rating[i])
                cancelBtn.style.display='none'
                console.log('cancel button was clicked')
                review[i+1].innerHTML=firstchild
                editReview()
            })
            const submitBtn=document.createElement('button')
            submitBtn.classList.add('btn')
            submitBtn.classList.add('btn-success')
            submitBtn.classList.add('mr-auto')
            submitBtn.textContent='Post'
            editForm[i].after(cancelBtn)
            editForm[i].appendChild(submitBtn)
            editForm[i].insertBefore(ratingLabel,editForm[i].children[1])
            editForm[i].insertBefore(inputLabel,editForm[i].children[2])
            
            
            
           
            
        })
    }

 }
 editReview()


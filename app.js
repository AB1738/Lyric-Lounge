const express=require('express')
const app=express()
const session=require('express-session')
const axios=require('axios')
const path=require('path')
const ejsMate=require('ejs-mate')
const methodOverride = require('method-override')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const Review=require('./models/review')
const User=require('./models/users')
const cookieParser=require('cookie-parser')
require('dotenv').config()

const sessionConfig={
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.set('view engine', 'ejs')
app.engine('ejs',ejsMate)
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(methodOverride('_method'))
app.use(cookieParser())
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


const isAuthenticated=(req,res,next)=>{
    if(!req.isAuthenticated()){
        // Store the current URL in a cookie
        res.cookie('redirectUrl', req.originalUrl);
        console.log(res.cookie)
        // Redirect the user to the login page
        return res.redirect('/login');
    }else{
        next()
    }
}
const redirectBack=(req,res,next)=>{
    req.session.returnTo = req.query.returnTo || '/';
}

const isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params
    const review= await Review.findById(reviewId)
   if(!review.author.equals(req.user._id)){
    console.log('error','You do not have permission to do that!')
    return res.redirect(`/releases/${id}`)
   }
   next()
}


const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/LyricLounge')
    .then(()=>{
         console.log("Connection Open!!")
        })
        .catch(err=>{
            console.log('Oh no error')
            console.log(err)
        })



// Function to fetch artist data from MusicBrainz API
async function fetchArtistID(artistName) {
    try {
      const response = await axios.get('http://musicbrainz.org/ws/2/artist', {
        params: {
          query: artistName,
          fmt: 'json',
        }
      });
  
    //   Return the first artist found (assuming it's the one you're looking for)
      if (response.data.artists && response.data.artists.length > 0) {
        return response.data.artists[0];
      } else {
        console.log('Artist not found');
        return null;
      }
    // return response.data
    } catch (error) {
      console.error('Error fetching artist data:', error);
      return null;
    }
  }

  async function fetchArtistData(artistId) {
    try {
      const response = await axios.get(`https://musicbrainz.org/ws/2/artist/${artistId}?inc=release-groups+releases`, {
        params: {
          fmt: 'json',
        }
      });
    return response
    } catch (error) {
      console.error('Error fetching artist data:', error);
      return null;
    }
  }

  async function fetchArtistReleases(releaseGroupID) {
    try {
      const response = await axios.get(`https://musicbrainz.org/ws/2/release-group/${releaseGroupID}?inc=releases`, {
        params: {
          fmt: 'json',
        }
      });
    return response
    } catch (error) {
      console.error('Error fetching artist data:', error);
      return null;
    }
  }

  async function fetchCoverArt(releaseGroupID) {
    try {
      const response = await axios.get(`https://coverartarchive.org/release-group/${releaseGroupID}`, {
        params: {
          fmt: 'json',
        }
      });
    return response
    } catch (error) {
      console.error('Error fetching artist data:', error);
      return null;
    }
  }

  async function fetchCoverArtRelease(releaseID) {
    try {
      const response = await axios.get(`https://coverartarchive.org/release/${releaseID}`, {
        params: {
          fmt: 'json',
        }
      });
    return response
    } catch (error) {
      console.error('Error fetching artist data:', error);
      return null;
    }
  }

  async function fetchArtistTracklist(releaseID) {
    try {
      const response = await axios.get(`https://musicbrainz.org/ws/2/release/${releaseID}?inc=recordings+artist-credits`, {
        params: {
          fmt: 'json',
        }
      });
  
    return response
    } catch (error) {
      console.error('Error fetching artist data:', error);
      return null;
    }
  }
  


app.get('/',(req,res)=>{
    res.render('home',{user:req.user})
})





app.post('/releases',async(req,res)=>{
    const {artist}=req.body
    res.redirect(`/releases?artist=${artist}&page=${1}`)
})


app.get('/releases',async(req,res)=>{
    const artist=req.query.artist
    const response=await fetchArtistID(artist) //fetching artist info that contains id
    const artistId=response.id //setting artist id from response object to custom variable
    const releases=await fetchArtistData(artistId) //using artistid to search from realese-group projects pertaining to that artist
    const albums=releases.data['release-groups'].filter(r => r['primary-type'] === 'Album') //filtering the releases to only contain albums

    let coverArtArray=[]

    function paginateArray(array, page, perPage) {
        const totalItems = array.length;
        const totalPages = Math.ceil(totalItems / perPage);
        const currentPage = Math.min(Math.max(1, page), totalPages);
    
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, totalItems);
    
        const paginatedArray = array.slice(startIndex, endIndex);
    
        return {
            currentPage: currentPage,
            totalPages: totalPages,
            perPage: perPage,
            totalItems: totalItems,
            items: paginatedArray
        };
    }
    
    const page = req.query.page || 1;
    const perPage = 6;
    
    const result = paginateArray(albums, page, perPage);


    for(let albums of result.items){
     const coverArt=await fetchCoverArt(albums.id)
     coverArtArray.push(coverArt.data.images[0].image)
    }
    res.render('releases',{artist,albums,coverArtArray,result,user:req.user})

})

app.get('/releases/:id',async(req,res)=>{
    const{id}=req.params
   const data= await fetchArtistTracklist(id)
   const coverArt=await fetchCoverArtRelease(id)
   const tracks=data.data.media[0].tracks


function getTimeLength(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours != "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}
    const reviews=await Review.find({albumId:id}).populate('author')
    res.render('viewRelease',{tracks,data,coverArt,getTimeLength,reviews,user:req.user})

})


app.post('/releases/:id',async(req,res)=>{
    const {id}=req.params
    const{rating,comment}=req.body
    const review=new Review({albumId:id,rating:rating,comment:comment})
    review.author=req.user
    console.log(review)
    await review.save()
    res.redirect(`/releases/${id}`)
})

app.patch('/releases/:id/review/:reviewId',isReviewAuthor,async(req,res)=>{
    const {id,reviewId}=req.params
    const{rating,comment}=req.body
    const review=await Review.findByIdAndUpdate(reviewId,{rating:rating,comment:comment}).populate('author')

    res.redirect(`/releases/${id}`)
})

app.delete('/releases/:id/review/:reviewId',isReviewAuthor,async(req,res)=>{
    const {id,reviewId}=req.params
    const review=await Review.findByIdAndDelete(reviewId)
    res.redirect(`/releases/${id}`)

})

app.get('/register',(req,res)=>{
    res.render('register',{user:req.user})
})

app.post('/register',async(req,res)=>{
    const{username,password,email}=req.body
    const user=new User({username,email})
    const newUser=await User.register(user,password)
    console.log(newUser)
    res.redirect('/')
})

app.get('/login',(req,res)=>{
    res.render('login',{user:req.user})
})

app.post('/login',passport.authenticate('local', { failureRedirect: '/login' }),async(req,res)=>{
    const redirectUrl = req.cookies.redirectUrl || '/';
    res.clearCookie('redirectUrl'); // Clear the cookie after use
    res.redirect(redirectUrl);
})



app.get('/protected',isAuthenticated,(req,res)=>{
    res.send("you made it to the protected route")
})

app.post('/logout',(req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect(req.headers.referer || '/');//redirects users to page they were on before they logged out
      });
})

app.listen('3000',()=>{
    console.log('listeneninin')
})




const express=require('express')
const app=express()
const session=require('express-session')
const axios=require('axios')
const path=require('path')
const ejsMate=require('ejs-mate')
const methodOverride = require('method-override')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Review=require('./models/review')
const User=require('./models/users')
require('dotenv').config()

// const sessionConfig={
//     secret:'thisshouldbeabettersecret',
//     resave:false,
//     saveUninitialized:true,
//     cookie:{
//         expires:Date.now()+1000*60*60*24*7,
//         maxAge:1000*60*60*24*7
//     }
// }

app.set('view engine', 'ejs')
app.engine('ejs',ejsMate)
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(methodOverride('_method'))
// app.use(session(sessionConfig))
// app.use(passport.initialize());
// app.use(passport.session());


// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())
// passport.use(new LocalStrategy(User.authenticate()));


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
    res.render('home')
})


app.get('/home',(req,res)=>{ 
    res.send('ooga booga')
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
    res.render('releases',{artist,albums,coverArtArray,result})

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
    const reviews=await Review.find({albumId:id})
    res.render('viewRelease',{tracks,data,coverArt,getTimeLength,reviews})

})


app.post('/releases/:id',async(req,res)=>{
    const {id}=req.params
    const{rating,comment}=req.body
    const review=new Review({albumId:id,rating:rating,comment:comment})
    await review.save()
    res.redirect(`/releases/${id}`)
})

app.patch('/releases/:id/review/:reviewId',async(req,res)=>{
    const {id,reviewId}=req.params
    const{rating,comment}=req.body
    const review=await Review.findByIdAndUpdate(reviewId,{rating:rating,comment:comment})
    res.redirect(`/releases/${id}`)
})

app.delete('/releases/:id/review/:reviewId',async(req,res)=>{
    const {id,reviewId}=req.params
    const review=await Review.findByIdAndDelete(reviewId)
    res.redirect(`/releases/${id}`)

})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post('/register',async(req,res)=>{
    const{username,password,email}=req.body
    // const user=new User({username,email,password})
    const user=User.register(new User({username,password}))
    console.log(user)
    // await user.save()
    res.redirect('/')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/login',async(req,res)=>{
    res.redirect('/')
})

app.get('/logout',(req,res)=>{
    res.render('logout')
})

app.post('/logout',(req,res,next)=>{
    // req.logout(function(err) {
    //     if (err) { return next(err); }
    //     res.redirect('/');
    //   });
})

app.listen('3000',()=>{
    console.log('listeneninin')
})




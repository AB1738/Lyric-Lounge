const express=require('express')
const app=express()
const axios=require('axios')
const path=require('path')
const ejsMate=require('ejs-mate')
const methodOverride = require('method-override')
const Review=require('./models/review')
require('dotenv').config()





const apiKey = process.env.DISCOGS_API_KEY;
const apiSecret = process.env.DISCOGS_API_SECRET;




app.set('view engine', 'ejs')
app.engine('ejs',ejsMate)
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(methodOverride('_method'))

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
    // fetchData()
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
    console.log(coverArtArray)
    res.render('releases',{artist,albums,coverArtArray,result})

})

app.get('/releases/:id',async(req,res)=>{
    const{id}=req.params
   const data= await fetchArtistTracklist(id)
   const coverArt=await fetchCoverArtRelease(id)
//    console.log(coverArt.data.images[0].image)
   const tracks=data.data.media[0].tracks
//    console.log(data.data.media[0].tracks)


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
    // console.log('Album Artist:'+data.data['artist-credit'][0].artist.name)   //Name of album artist

    // for(artist of tracks[4]['artist-credit']){
    //     console.log(artist.name)    //get all artists on the 5th song
    // }
    // console.log(tracks[4]['artist-credit'])
    // res.redirect('/')
})


app.post('/releases/:id',async(req,res)=>{
    const {id}=req.params
    const{rating,comment}=req.body
    const review=new Review({albumId:id,rating:rating,comment:comment})
    await review.save()
    console.log(review)
    res.redirect(`/releases/${id}`)
})

app.patch('/releases/:id/review/:reviewId',async(req,res)=>{

})

app.delete('/releases/:id/review/:reviewId',async(req,res)=>{
    const {id,reviewId}=req.params
    const review=await Review.findByIdAndDelete(reviewId)
    res.redirect(`/releases/${id}`)

})

app.listen('3000',()=>{
    console.log('listeneninin')
})




  require('dotenv').config()


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
const cheerio=require('cheerio')
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const helmet =require('helmet')
const MongoDBStore=require('connect-mongo')(session)
const mongoStoreSecret=process.env.MONGO_STORE_SECRET
const sessionSecret=process.env.SESSION_SECRET
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/LyricLounge';
const PORT=process.env.PORT||3000


const store=new MongoDBStore({
  url:dbUrl,
  secret:mongoStoreSecret,
  touchAfter:24*60*60
})

store.on('error',function(e){
  console.log('Session store error',e)
})

const sessionConfig={
    store,
    secret:sessionSecret,
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
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://fonts.googleapis.com/",
    "https://fonts.gstatic.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://fonts.gstatic.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"

];

const fontSrcUrls = [
  "https://fonts.googleapis.com/",
  "https://fonts.gstatic.com/",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'",],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "*",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use((req,res,next)=>{
  res.locals.success=req.flash('success')
  res.locals.error=req.flash('error')
  next()
})

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
  try{
    const {id,reviewId}=req.params
    const review= await Review.findById(reviewId)
   if(!review.author.equals(req.user._id)){
    req.flash('error','You do not have permission to do that!')
    return res.redirect(`/releases/${id}`)
   }
   next()
  }catch(e){
    next(e)
  }
}

const mongoose=require('mongoose')
mongoose.connect(dbUrl)
    .then(()=>{
         console.log("Connection Open!!")
        })
        .catch(err=>{
            console.log('Oh no error')
            console.log(err)
        })

 const toTitleCase = str => str.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase())

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

  const songLyrics=async(artist,song)=>{
    try{
    const response=await axios.get(`https://api.lyrics.ovh/v1/${artist}/${song}`)
    const lyrics=response.data.lyrics.split("\n").slice(1).join("\n")
    return lyrics
    }catch(e){
        console.log('Invalid song and/or artist',e)
 
    }
   
}
async function fetchBillboard200Page() {
    const url = 'https://www.billboard.com/charts/billboard-200';
    try {
        const response = await axios.get(url, { timeout: 7500 });
        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.log('Error response status:', error.response.status);
            console.log('Error response data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.log('Error request:', error.request);
        } else {
            // Other errors
            console.log('Error message:', error.message);
        }
        // Log the error stack for debugging
        console.log('Error stack:', error.stack);
        return null;
    }
}



async function fetchBillboard100Page() {
  const url = 'https://www.billboard.com/charts/hot-100/';
  try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
  } catch (error) {
    console.log('Error fetching Billboard 100 page:',error.toJSON());
    return null;
  }
}

async function scrapeAlbumsAndArtists() {
  const html = await fetchBillboard200Page();
  if (!html) return;

  const $ = cheerio.load(html);
  const albums = [];
  $('.o-chart-results-list-row-container').each((index, element) => {
      const coverArt = $(element).find('img.c-lazy-image__img').attr('data-lazy-src')
      const album = $(element).find('h3.c-title.a-no-trucate').text().trim()
      const artist = $(element).find('span.c-label.a-no-trucate').text().trim()
      albums.push({ coverArt,album, artist });
  });
  return albums;
}
async function scrapeSongsAndArtists() {
  const html = await fetchBillboard100Page();
  if (!html) return;

  const $ = cheerio.load(html);
  const songs = [];
  $('.o-chart-results-list-row-container').each((index, element) => {
      const coverArt = $(element).find('img.c-lazy-image__img').attr('data-lazy-src')
      const song = $(element).find('h3.c-title.a-no-trucate').text().trim()
      const artist = $(element).find('span.c-label.a-no-trucate').text().trim()
      songs.push({ coverArt,song, artist });
  });
  return songs;
}

  

app.get('/',async(req,res,next)=>{
  try{
  const albums=await scrapeAlbumsAndArtists()
  const songs=await scrapeSongsAndArtists()
  
  res.render('home',{user:req.user,albums,songs})
  }catch(e){
    next(e)
  }
})





app.post('/releases',async(req,res,next)=>{
  try{
    const {artist}=req.body
    res.redirect(`/releases?artist=${artist}&page=${1}`)
  }catch(e){
    next(e)
  }
})


app.get('/releases',async(req,res,next)=>{
  try{
    const artist=req.query.artist
    const response=await fetchArtistID(artist) //fetching artist info that contains id
    const artistId=response.id //setting artist id from response object to custom variable
    const releases=await fetchArtistData(artistId) //using artistid to search from realese-group projects pertaining to that artist
    const albums=releases.data['release-groups'].filter(r => r['primary-type'] === 'Album'&&!r['secondary-types'].includes('Compilation')) //filtering the releases to only contain albums
    if(albums.length<1){
      next()
    }
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
    
    let result = paginateArray(albums, page, perPage);
    
  

    for(let albums of result.items){
     const coverArt=await fetchCoverArt(albums.id)
     if(coverArt==null){
      next()
     }else{
     coverArtArray.push(coverArt.data.images[0].image)
     }
    }

    if(coverArtArray.length<1){
      next()
    }

    res.render('releases',{artist,albums,coverArtArray,result,user:req.user,toTitleCase})
  }catch(e){
    next(e)
  }
})

app.get('/releases/:id',async(req,res,next)=>{
  try{
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
  }catch(e){
    next(e)
  }
})


app.post('/releases/:id',isAuthenticated,async(req,res,next)=>{
  try{
    const {id}=req.params
    const{rating,comment}=req.body
    const review=new Review({albumId:id,rating:rating,comment:comment})
    review.author=req.user
    console.log(review)
    await review.save()
    req.flash('success','Review successfully posted')
    res.redirect(`/releases/${id}`)
  }catch(e){
    next(e)
  }
})

app.get('/releases/:id/review/:reviewId',isAuthenticated,isReviewAuthor,(req,res,next)=>{
  try{
  const {id,reviewId}=req.params
  res.render('editReview',{user:req.user,id,reviewId})
  }catch(e){
    next(e)
  }

})

app.patch('/releases/:id/review/:reviewId',isReviewAuthor,async(req,res,next)=>{
  try{
    const {id,reviewId}=req.params
    const{rating,comment}=req.body
    const review=await Review.findByIdAndUpdate(reviewId,{rating:rating,comment:comment}).populate('author')
    req.flash('success','Review successfully edited')
    res.redirect(`/releases/${id}`)
  }catch(e){
    next(e)
  }
})

app.delete('/releases/:id/review/:reviewId',isReviewAuthor,async(req,res)=>{
  try{
    const {id,reviewId}=req.params
    const review=await Review.findByIdAndDelete(reviewId)
    req.flash('success','Review successfully deleted')
    res.redirect(`/releases/${id}`)
  }catch(e){
    next(e)
  }
})

app.get('/register',(req,res)=>{
    res.render('register',{user:req.user})
})

app.post('/register',async(req,res,next)=>{
  try{
    const{username,password,email}=req.body
    const user=new User({username,email})
    const newUser=await User.register(user,password)
    console.log(newUser)
    res.redirect('/')
  }catch(e){
    console.log(e.message)
    if(e.message=='A user with the given username is already registered')
    {
      req.flash('error',`${e.message}. Please enter a valid username.`)
      return res.redirect('/register')
    }
    if(e.message.includes('E11000')){
      req.flash('error',`A user with the given email is already registered. Please enter a valid email.`)
      return res.redirect('/register')
    }
    next(e)
  }
})

app.get('/login',(req,res)=>{
    res.render('login',{user:req.user})
})

app.post('/login',passport.authenticate('local', { failureRedirect: '/login' ,failureFlash:true}),async(req,res)=>{
    const redirectUrl = req.cookies.redirectUrl || '/';
    res.clearCookie('redirectUrl'); // Clear the cookie after use
    req.flash('success', `Welcome back ${req.user.username}`)
    res.redirect(redirectUrl);
})





app.post('/logout',(req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', `Goodbye. See you soon!`)
        res.redirect(req.headers.referer || '/');//redirects users to page they were on before they logged out
      });
})

app.get('/lyrics/:artist/:song',async(req,res)=>{
  const{artist,song}=req.params
  const lyrics=await songLyrics(artist,song)
  
  res.render('lyrics',{user:req.user,artist,song,lyrics,toTitleCase})
})
app.post('/lyrics/',(req,res)=>{
  const{artist,song}=req.body
  res.redirect(`/lyrics/${artist}/${song}`)
})

app.get('/hot-songs',async(req,res,next)=>{
  try{
  const songs=await scrapeSongsAndArtists()
  res.render('hotSongs',{user:req.user,songs})
  }catch(e){
    next(e)
  }
})
app.get('/hot-albums',async(req,res,next)=>{
  try{
  const albums=await scrapeAlbumsAndArtists()
  res.render('hotAlbums',{user:req.user,albums})
  }catch(e){
  next(e)
  }
})


app.all('*',(req,res,next)=>{
  res.status(404).render('404',{user:req.user})
})

app.use((err,req,res,next)=>{
  if(err.message=="Cannot read properties of null (reading 'id')"){
    return res.status(404).render('404',{user:req.user})
  }
  if(err.message=="Cannot read properties of null (reading 'author')"){
    return res.status(404).render('404',{user:req.user})
  }
  console.log(err.message)
  res.status(404).render('404',{user:req.user})
})




app.listen(PORT,()=>{
    console.log('listeneninin')
})




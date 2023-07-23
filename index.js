const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/', async (req, res) => {
    const song = await getSong();
    res.send(song);
})

app.get('/allSongs', async (req, res) => {
  const songs = await getSongsMetadata();
  res.send(songs);
})

app.use('/urls', express.static('./All_Out_2010s'));

const port = process.env.PORT || 9001;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});

let filePath = './All_Out_2010s'

const getSongMetadata = async (filePath1, file1) => {

  const mm = await import("music-metadata");
  
  return new Promise ( resolve => {
    mm.parseFile(filePath1 + '/' + file1).then(metadata => {
      // console.log(metadata.common.picture);
      resolve({
        title: metadata.common.title, 
        artist: metadata.common.artist, 
        album: metadata.common.album
        // cover: mm.selectCover(metadata.common.picture)
        // cover: (metadata.common.picture ? metadata.common.picture[0].data.toString('base64') : null)
      });
    })
  })
}

const getSongsMetadata = () => {

  return new Promise( async resolve => {

    var songsData = await readFileAsync('songs.json');

    if (songsData)
      resolve(songsData);

    let metadata = []
    let fsObj = fs.readdirSync(filePath);
    for (const file of fsObj)
    {
      var data = await getSongMetadata(filePath, file);
      console.log("name", data);
      metadata.push(data)
    }
    const jsonData = JSON.stringify(metadata);

    fs.writeFile('songs.json', jsonData, (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });

    console.log("Resolved");
    resolve(metadata);
  });
}

const getAllSongs = async () => {

  return new Promise( (resolve) => {

    let names = []

    fs.readdirSync(filePath).forEach(file => {
      names.push(file)
    });

    console.log(names.length)

    resolve (names);

  })

}

function readFileAsync(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

const getSong = async () => {

  let date = new Date();
  
  let data = await readFileAsync('song.json');
  data ? data = JSON.parse(data) : data = [];

  if (!data[0])
  {
    console.log("No data saved");
  } else 
  {
    if (data[0].date == date.getDate())
    {
      console.log("Song already saved");
      return (data[0]);
    }
  }

  let names = await getAllSongs();

  console.log("length", names.length)

  const randomNumber = Math.floor(Math.random() * (names.length));

  console.log(names, randomNumber)

  const song = {
    id: randomNumber,
    src: names[randomNumber],
    date: date.getDate(),
  };

  console.log("song", song)

  const jsonData = JSON.stringify([song], null, 2);

  fs.writeFile('song.json', jsonData, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });

  return song;

}



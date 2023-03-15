import express from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import { convertHoursStringToMinutes} from './utils/convert-hour-string-to-minutes' 
import { convertMinutesToHoursString } from './utils/convert.minutes-to-hour-string'

const app = express();

app.use(express.json());
app.use(cors());

const prisma = new PrismaClient({
 log: ["query"]
  
});

app.get('/games', async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count:{
        select:{
          ads: true,

          
        },
        },
      },
    
    });
  return response.status(200).json([games]);
});

app.post('/games/:id/ads',async (request, response) => {
  const gameId = request.params.id;
  const body = request.body;
  console.log({gameId, body});
    
  try{
  const ad = await prisma.ad.create({
    data:{
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: convertHoursStringToMinutes(body.hourStart),
      hourEnd: convertHoursStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel
      
    },
  });


  return response.status(201).json([ad]);
} catch (error){
  return response.status(401).json(error)
}
});

app.get('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name:true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
      
    },
    where:{
      gameId,
    },
    orderBy: {
      createAt: 'desc',
    },
  });
  return response.status(200).json(
    ads.map(ad => {
      return{
      ...ad,
      weekDays: ad.weekDays.split(','),
     hourStart: convertMinutesToHoursString(ad.hourStart),
     hourEnd: convertMinutesToHoursString(ad.hourEnd),
};
  })
  )
});

app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id;
  const ad = await prisma.ad.findUniqueOrThrow({
    select:{
      discord: true,
    },
    where: {
      id: adId,
    }
  })
  return response.status(200).json({
    discord : ad.discord
  });
  
});
app.listen(3333), () => console.log('Server on Port: 3333 🚀')



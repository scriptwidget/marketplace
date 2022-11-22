const API_URL = "https://episodate.com/api/show-details?q="

const DEBUG = false

const colors = {
  primary: "#080808",
  secondary: "#355e3b",
  text: {
    primary: "white",
    secondary: "#B6B6B4"
  }
}

const currentDate = !DEBUG ? Date.now() :
  new Date("2022-09-12T10:20:30Z")

const serieName = !DEBUG ? $getenv("widget-param") :
  "the-lord-of-the-rings"

const fetchSerie = async s => {
  const r = await fetch(API_URL + s)
  DEBUG && console.log(r)
  return JSON.parse(r)
}

const formatDate = date => {
  return new Date(date.replace(" ", "T") + "Z")
}

const getTimeLeft = airDate => {

  let res
  const millis = airDate - currentDate
  const secondsLeft = millis / 1000

  const getDays = seconds => {
    return Math.round(seconds / (3600 * 24))
  }

  const getHours = seconds => {
    return Math.round(seconds % (3600 * 24) / 3600)
  }

  const getMinutes = seconds => {
    return Math.round(seconds % 3600 / 60)
  }
  
  if (getDays(secondsLeft) > 0) {
    res = getDays(secondsLeft) + "d "
    res += getHours(secondsLeft) + "h "
    
  } else if (getHours(secondsLeft) > 0) {
    res = getHours(secondsLeft) + " h "
    
  } else {
    res = getMinutes(secondsLeft) + " m "
  }
    
  return res + "left"
}

const getEpisodeData = function(info, id) {
  const reverseIdUsed = id < 0
  const episodes = info["episodes"]

  return reverseIdUsed ?
    episodes[episodes.length + id] :
    episodes[id]
}

const Logo = ({logoPath}) => {
   return (
    <zstack
      padding="40,0,40,30"
      frame="80,80,trailing"
    >
      <image 
        url={logoPath} 
        frame="90,120,trailing" 
      />
      <rect
         color={colors.secondary}
         stroke="1.5"
         frame="95,125"
       />
    </zstack>
  )
}

const TimeRemaining = ({info, countdown}) => {

  const getPercent = () => {

    const lastEpisodeId = countdown.id - 1

    if (lastEpisodeId < 0) return null
    
    const lastReleasedEpisode = 
      getEpisodeData(info, lastEpisodeId)

    const total =
      formatDate(countdown.air_date) -
      formatDate(lastReleasedEpisode.air_date)

    const passed = 
      formatDate(countdown.air_date) -
      currentDate

    return (total - passed) / total
  }

  const nextEpisodeRemaining = countdown => {
    const airDate = formatDate(countdown.air_date)
    
    return getTimeLeft(airDate)
  }
  
  return (
    <zstack
      frame="30,topLeading"
      padding="leading,80"
    >
      <circle
          stroke="5"
          color="gray"
      />
      {
        countdown != null
        && getPercent() != null ?
        <circle
          stroke="5"
          trim={getPercent()}
          rotation={90 * 3}
          color={colors.secondary}
        /> : null
      }
      <text
        font="7"
        color={colors.text.secondary}
      >
        {
          countdown == null ? "???"
          : nextEpisodeRemaining(countdown)
        }
      </text>
    </zstack>
  )
}

const Entry = ({info}) => {

  const getCountdown = info => {

    const episodeCount = info.episodes.length
    const lastEpisode = getEpisodeData(info, -1)

    if (formatDate(lastEpisode.air_date) < currentDate) {
      return null
    }

    for (let i = 0; i <episodeCount; i++) {
      let episodeData = info.episodes[i]

      if (formatDate(episodeData.air_date) > currentDate) {
        episodeData.id = i
        return episodeData
      }
    }

    return null
  }

  const countdown = getCountdown(info)

  return (
    <zstack padding="10">
      <hstack 
        frame="max" 
        background={colors.primary}
      >
        <Logo
          logoPath={info.image_path} 
        />
        <vstack
          alignment="trailing"
          padding="top,10"
        >
          <text
            font="15"
            padding="leading,25"
            frame="150,15,topLeading"
            color={colors.text.secondary}
          >
            {info.name}
          </text>
          {
            info.status == "Ended" ?

            <text
              padding="0,0,5,30"
              font="15"
              color={colors.text.primary}
            >
              Series Ended
            </text>

            :

            <vstack
              alignment="trailing"
              frame="max,bottomLeading"
            >
              <hstack>
                <text
                  frame="30,topLeading"
                  font="caption"
                  color={colors.text.secondary}
                >
                  Waiting for: 
                </text>
                <text
                  padding="5"
                  frame="30,topLeading"
                  font="caption"
                  color={colors.text.primary}
                >
                  {
                    countdown == null ? 
                    "next season" : 
                    `s${countdown.season}e${countdown.episode}`
                  }
                </text>
              </hstack>
              <TimeRemaining
                info={info}
                countdown={countdown}
              />
            </vstack>
          }
          <spacer/>
        </vstack>
      </hstack>                   
    </zstack>
  )
}

const serie = await fetchSerie(serieName)

$render(
  <Entry
    info={serie.tvShow}
  />
);
const API_URL = "https://episodate.com/api/show-details?q="

const DEBUG = false

const colors = {
  primary: "#080808",
  primaryAlt: "#252b24",
  secondary: "#355e3b",
  black: "black",
  text: {
    primary: "#d8e3d8",
    secondary: "#7d7d7d"
  }
}

const canvasGradient = {
  type: "linear",
  colors: [
    colors.primary,
    colors.primaryAlt,
    colors.primary
  ],
  startPoint: "topLeading",
  endPoint: "bottomTrailing"
}

const currentDate = !DEBUG ? Date.now() :
  new Date("2022-09-16T10:20:30Z")

const serieName = !DEBUG ? $getenv("widget-param") :
  "house-of-the-dragon"


const getDefaultSeriesData = () => {
  return {
    tvShow: {
      name: "Failed to fetch",
      image_path: null
    }
  }
}

const isDefaultSeriesData = (serie) => {
  return JSON.stringify(serie) 
    == JSON.stringify(getDefaultSeriesData())
}

const fetchSerie = async s => {
  let response = JSON.stringify(getDefaultSeriesData())
  try {
    response = await fetch(API_URL + s)
  } catch (error) {
    console.log("Failed to fetch series data: " + error)
  }
  
  DEBUG && console.log(response)
  return JSON.parse(response)
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

const Logo = ({logoPath}) => {
   return (
    <zstack
      padding="40,0,40,30"
      alignment="center"
      frame="80,80,trailing"
    >
      {
        logoPath != null ?

        <image 
          url={logoPath} 
          alignment="center"
          frame="90,120,trailing" 
        />

        :

        null
      }
      <rect
         color={colors.black}
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

const Entry = ({info, countdown}) => {

  let status

  if (countdown == null &&
      info.name == getDefaultSeriesData().tvShow.name) {
    status = "connection"
  } else if (countdown == null) {
    status = "next season"
  } else {
    status = `s${countdown.season}e${countdown.episode}`
  }

  return (
    <zstack 
      padding="5"
      corner="15"
      color={$gradient(canvasGradient)}
    >
      <hstack 
        frame="max" 

        background={$gradient(canvasGradient)}
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
                  {status}
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
const countdown = isDefaultSeriesData(serie) ?
        null : getCountdown(serie.tvShow)

$render(
    <Entry
      info={serie.tvShow}
      countdown={countdown}
    />
);
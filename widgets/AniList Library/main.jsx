// Add your username here
const USERNAME = "Reina";

// Set the media type as a widget parameter (that way you can have both anime and manga widgets). Defaults to ANIME. Options are ANIME and MANGA.
const PARAMS = $getenv("widget-param");
const MEDIA = PARAMS?.toUpperCase() || "ANIME";

// Sort options are:
// MEDIA_ID, MEDIA_ID_DESC
// SCORE, SCORE_DESC
// STATUS, STATUS_DESC
// PROGRESS, PROGRESS_DESC, PROGRESS_VOLUMES, PROGRESS_VOLUMES_DESC
// REPEAT, REPEAT_DESC
// PRIORITY, PRIORITY_DESC
// STARTED_ON, STARTED_ON_DESC
// FINISHED_ON, FINISHED_ON_DESC
// ADDED_TIME, ADDED_TIME_DESC
// UPDATED_TIME, UPDATED_TIME_DESC
// MEDIA_TITLE_ROMAJI, MEDIA_TITLE_ROMAJI_DESC, MEDIA_TITLE_ENGLISH, MEDIA_TITLE_ENGLISH_DESC, MEDIA_TITLE_NATIVE, MEDIA_TITLE_NATIVE_DESC, MEDIA_POPULARITY, MEDIA_POPULARITY_DESC
const SORT_METHOD = "UPDATED_TIME_DESC";

// Widget size
const wsize = $getenv("widget-size");
const isSmall = wsize === "small";
const isMedium = wsize === "medium";
const isLarge = wsize === "large";

// Fonts
const titleFont = isSmall ? "11,bold" : "15,bold";
const detailsFont = "10";

// Sets the amount of items to display in the widget
const mediaMap = () => {
  if (isSmall) return [0, 1];
  if (isMedium) return [0, 1, 2];
  if (isLarge) return [0, 1, 2, 3, 4, 5];
  return [0];
};

const timeUntil = (next) => {
  if (next < 60) {
    return next + " seconds";
  }
  if (next < 3600) {
    return Math.round(next / 60) + " minutes";
  }
  if (next < 86400) {
    return Math.round(next / 3600) + " hours";
  }
  if (next < 518400) {
    return Math.round(next / 86400) + " days";
  }
  if (next < 604800) {
    return "a week";
  }
  if (next < 259200) {
    return Math.round(next / 86400) + " days";
  }
  if (next < 31536034.56) {
    return Math.round(next / 2628002.88) + " months";
  }
  return "";
};

const colourPicker = (colour) => {
  const colourMap = {
    blue: "61B1EC",
    purple: "B368F6",
    green: "70C661",
    orange: "E28D3A",
    red: "D0433C",
    pink: "EEA2D3",
    grey: "6B7A91",
  };

  return `#${colourMap[colour ?? "pink"]}`;
};

const query = `
query ($username: String, $type: MediaType, $sort: [MediaListSort], $perPage: Int) {
  Page (page: 1, perPage: $perPage) {
    mediaList (userName: $username, type: $type, status_in: CURRENT, sort: $sort) {
      progress
      media {
        title {
          english
          romaji
        }
        coverImage {
          medium
        }
        status
        episodes
        chapters
        
        nextAiringEpisode {
          timeUntilAiring
          episode
        }
      }
      user {
        options {
          profileColor
        }
      }
    }
  }
}
`;

const variables = {
  username: USERNAME,
  type: MEDIA,
  sort: SORT_METHOD,
  perPage: mediaMap().length,
};

const res = await $http.post("https://graphql.anilist.co", {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    query: query,
    variables: variables,
  }),
});

const data = await JSON.parse(res);

const colour = colourPicker(
  data?.data?.Page?.mediaList[0]?.user?.options?.profileColor ?? "pink"
);

const LeftAlign = ({ props: { frame }, children }) => {
  return (
    <hstack spacing="0" padding="0" frame={frame}>
      {children}
      <spacer />
    </hstack>
  );
};

const Media = ({ props: { mediaItem } }) => {
  const { media, progress, user } = mediaItem;
  const { episodes, chapters, title, nextAiringEpisode, coverImage, status } =
    media;

  const fullProgress =
    status === "RELEASING" ? nextAiringEpisode?.episode : null;

  return (
    <hstack>
      <Poster img={media.coverImage.medium} />
      <vstack spacing="0" frame="max">
        <Title title={title} />
        <ProgressText
          progress={progress}
          total={episodes ?? chapters}
          nextEpisodeDate={nextAiringEpisode?.timeUntilAiring}
          nextEpisode={nextAiringEpisode?.episode}
          type={episodes ? "episode" : "chapter"}
        />
        <Progress
          current={progress}
          max={episodes ?? chapters ?? (progress || 1) * 5}
          secondary={fullProgress}
        />
      </vstack>
      <spacer />
    </hstack>
  );
};

const Poster = ({ props: { img } }) => {
  return <image frame="30,50" mode="fill" clip url={img} corner="2" />;
};

const Title = ({ props: { title } }) => {
  const parsedTitle = title?.english ?? title?.romaji;

  const font = titleFont;

  return (
    <LeftAlign>
      <text font={font}>{parsedTitle}</text>
    </LeftAlign>
  );
};

const ProgressText = ({
  props: { progress, total, nextEpisode, nextEpisodeDate, type },
}) => {
  const font = detailsFont;

  return (
    <hstack padding="3,0,3,0">
      <text font={font} color={colour}>
        {progress} / {total ?? "??"} {type}s
      </text>
      <spacer />
      {nextEpisode && (
        <text font={font} color={colour}>
          Episode {nextEpisode} in {timeUntil(nextEpisodeDate)}
        </text>
      )}
      <spacer />
    </hstack>
  );
};

const progress = (fullWidth, currentWidth, max) => {
  return Math.round((fullWidth * currentWidth) / max);
};

const Progress = ({ props: { current, max, secondary, w, h } }) => {
  const width = w ?? isSmall ? 90 : 265;
  const height = h ?? 6;
  const firstBarHeight = secondary ? height - 2 : height;
  return (
    <zstack frame="4">
      <hstack>
        <rect frame={`${width},${height}`} color="grey" corner="3"></rect>
        <spacer />
      </hstack>
      <vstack spacing="0">
        <ProgressBar
          current={current}
          max={max}
          width={width}
          height={firstBarHeight}
        />
        {secondary && (
          <ProgressBar current={secondary} max={max} width={width} height={2} />
        )}
      </vstack>
    </zstack>
  );
};

const ProgressBar = ({
  props: { current, max, width, height, color = colour },
}) => {
  return (
    <hstack>
      <rect
        frame={`${progress(width, current, max)},${height}`}
        color={color}
        corner="3"
      ></rect>
      <spacer />
    </hstack>
  );
};

$render(
  <vstack padding="5" spacing="3">
    {mediaMap().map((i) => {
      const mediaItem = data?.data?.Page?.mediaList[i];
      return <Media mediaItem={mediaItem} />;
    })}
  </vstack>
);

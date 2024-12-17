import { Devvit, useForm, useState, useAsync } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

// Placeholder subreddit list
const SUBREDDITS = [
  'r/aww',
  'r/funny',
  'r/gaming',
  'r/wholesomememes',
  'r/space',
  'r/technology',
  'r/science',
  'r/animalsbeingbros',
  'r/pics',
  'r/Art',
  'r/UpliftingNews',
  'r/todayilearned',
  'r/explainlikeimfive',
  'r/showerthoughts',
  'r/interestingasfuck',
  'r/natureisfuckinglit',
  'r/photography',
  'r/holistichealth',
  'r/selfimprovement',
  'r/NoStupidQuestions',
  'r/TrueReddit',
  'r/Minimalism',
  'r/DIY',
  'r/Design',
  'r/InteriorDesign',
  'r/learnprogramming',
  'r/webdev',
  'r/coding',
  'r/futurology',
  'r/creativity',
  'r/illustration',
  'r/learnjava',
  'r/fitness',
  'r/WeightLoss',
  'r/fitnessmotivation',
  'r/ArtHistory',
  'r/Entrepreneur',
  'r/startups',
  'r/Motivation',
  'r/ContentCreators',
  'r/SmallBusiness',
  'r/goalsetting',
  'r/PositiveTechnology',
  'r/holistichealth',
  'r/productivity',
  'r/Frugal',
  'r/PhotographyPorn',
  'r/AskScienceFiction',
  'r/illustrationart',
  'r/creativecoding',
  'r/ArtPorn',
  'r/cosmology',
  'r/bioinformatics',
  'r/Psychology',
  'r/learning',
  'r/learnmath',
  'r/philosophy',
  'r/machinelearning',
  'r/ArtificialIntelligence',
  'r/deeptech',
  'r/robotics',
  'r/biochemistry',
  'r/foodporn',
  'r/healthyfood',
  'r/fitnessjourney',
  'r/Yoga',
  'r/nutrition',
  'r/BodyweightFitness',
  'r/running',
  'r/gardening',
  'r/Outdoor',
  'r/Camping',
  'r/backpacking',
  'r/wildlife',
  'r/Geography',
  'r/Geology',
  'r/PhilosophyOfScience',
  'r/TechNewsToday',
  'r/Techno',
  'r/FreshStart',
  'r/SkincareAddiction',
  'r/mentalhealth',
  'r/itsokaynottobeokay',
  'r/crafting',
  'r/EcoFriendly',
  'r/Entrepreneur',
  'r/FinancialIndependence',
  'r/Business',
  'r/ContentMarketing',
  'r/CareerAdvice',
  'r/ProductivityTips',
  'r/ProjectManagement',
  'r/Investing',
  'r/PersonalFinance',
  'r/Budgeting'
];

// Main Devvit App
Devvit.addCustomPostType({

  name: 'Guess the Subreddit Game',
  height: 'tall',
  render: (context) => {
    return <GuessTheSubredditGame context={context} useForm={useForm} useState={useState} ui={context.ui} />;
  },
});

// Main Devvit App
Devvit.addMenuItem({
  label: 'Create Guess the Subreddit Game',
  location: 'subreddit',
  onPress: async (_, context) => {
    const currentSubreddit = await context.reddit.getCurrentSubreddit();
    await context.reddit.submitPost({
      title: 'Guess the Subreddit Game',
      subredditName: currentSubreddit.name,
      preview: (
        <vstack alignment='center middle' gap='small'>
          <text>Loading Guess the Subreddit Game...</text>
        </vstack>
      ),
    });
    context.ui.showToast('Created a new Guess the Subreddit Game post!');
  },
});

// Separate component that handles the game logic
function GuessTheSubredditGame({ context, useForm, useState, ui }: { context: any, useForm: any, useState: any, ui: any }) {
  const [guess, setGuess] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Add this line

  const { data: gameData, loading, error } = useAsync(async () => {
    const subreddit = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
    const post = await fetchPostFromSubreddit(subreddit, context);
    return { subreddit, post };
  }, { depends: { gameKey } });

  const guessForm = useForm(
    {
      fields: [
        {
          name: 'guess',
          label: 'Your Guess (e.g., r/funny)',
          type: 'string',
        },
      ],
    },
    (values: any) => {
      setGuess(values.guess);
      setHasGuessed(true); // Set hasGuessed to true when the user submits a guess
    }
  );

  if (loading) return <text>Loading...</text>;
  if (error) return <text>Error: {error.message}</text>;
  if (!gameData) return <text>No data available</text>;

  const { subreddit, post } = gameData;

  // Game UI
  return (
    <vstack alignment="center middle"  padding="medium" backgroundColor="#f8f8f8"  width="100%" height="100%">
      {hasGuessed ? (
        guess === subreddit ? (
          <vstack alignment="center" gap="small">
            <text size="xlarge" weight="bold" color="green">
              🎉 Correct! The post is from {subreddit}
            </text>
          </vstack>
        ) : (
          <vstack alignment="center" gap="small">
            <text size="xlarge" weight="bold" color="red">
              ❌ Wrong! It was actually from {subreddit}
            </text>
          </vstack>
        )
      ) : (
        <>
          <vstack alignment="center middle" >
            <text size="large" weight="bold" color="#333">
              Can you guess which subreddit this post is from?
            </text>
            {formatPostContent(post)}
          </vstack>
          <button onPress={() => ui.showForm(guessForm)} appearance="primary" width="200px"  >
            Make a Guess
          </button>
        </>
      )}
  
  {hasGuessed && (
        <hstack 
          width="200px"
          backgroundColor="#FF5733"
          alignment="center middle"
          padding="small"
          onPress={() => {
            setGuess('');
            setHasGuessed(false);
            setGameKey(prevKey  => prevKey + 1); // Add this line
          }}
        >
          <text color="white">Play Again</text>
        </hstack>
      
      )}
    </vstack>
  );

  // Function to fetch a random post from a subreddit
  async function fetchPostFromSubreddit(subreddit: string, context: any) {
    const subredditName = subreddit.replace(/^r\//, '');

    try {
      const posts = await context.reddit.getTopPosts({
        subredditName: subredditName,
        limit: 100,
      });

      const allPosts = await posts.all();
      const randomPost = allPosts[Math.floor(Math.random() * allPosts.length)];
      return {
        title: randomPost.title || 'No Title',
        body: randomPost.body || '',
        mediaUrl: randomPost.url || '',
        mediaType: randomPost.url ? getMediaType(randomPost.url) : null,
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      throw new Error('Failed to fetch subreddit post');
    }
  }

  // Function to get media type based on URL
  function getMediaType(url: string): string | null {
    if (url.match(/\.(jpg|jpeg|png|gif)$/)) {
      return 'image';
    } else if (url.match(/\.(mp4|webm|ogg)$/)) {
      return 'video';
    } else {
      return null;
    }
  }

  // Helper function to format the post content
  function formatPostContent(post: { title: string; body: string; mediaUrl: string; mediaType: string | null }) {
    return (
      <vstack gap="medium">
        <text style="heading" size="xlarge"  weight="regular"
  color="black"
  wrap
  overflow="ellipsis"
  maxHeight="200px">{post.title}</text>
        
        {post.body && (
          <text
  size="medium"
  weight="regular"
  color="black"
  wrap
  overflow="ellipsis"
  maxHeight="200px"
  
>
  {post.body}
</text>        )}
        
        {post.mediaType === 'image' && (
          <hstack alignment='center'>
          <image url={post.mediaUrl} imageWidth={250} 
          imageHeight={250}
          description="Post image"
         />
         </hstack>
        )}
        
        
      </vstack>
    );
  }
}
export default Devvit;




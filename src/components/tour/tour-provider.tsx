
'use client';

import { ShepherdTour, ShepherdTourContext } from 'react-shepherd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useCallback, Suspense } from 'react';
import 'shepherd.js/dist/css/shepherd.css';
import './tour-styles.css';

const TOUR_STORAGE_KEY = 'inventory-tour-completed';

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
    classes: 'shepherd-custom',
    scrollTo: { behavior: 'smooth', block: 'center' },
  },
  useModalOverlay: true,
};

const getSteps = (router: any) => [
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard!',
    text: 'This is your main hub. Let\'s take a quick tour of the key features to get you started.',
    buttons: [
      {
        text: 'Skip',
        type: 'cancel',
      },
      {
        text: 'Next',
        type: 'next',
      },
    ],
  },
  {
    id: 'sidebar-nav',
    title: 'Main Navigation',
    text: 'Use this sidebar to navigate between the main sections of the app: Inventory, Recipes, Sales, and more.',
    attachTo: { element: '[data-sidebar="content"]', on: 'right' },
    buttons: [
       {
        text: 'Back',
        type: 'back',
      },
      {
        text: 'Next',
        type: 'next',
      },
    ],
  },
  {
    id: 'inventory-step',
    title: 'Go to Inventory',
    text: 'Let\'s head to the Inventory page. This is where you\'ll manage all your items.',
    buttons: [
      {
        text: 'Go to Inventory',
        action() {
          router.push('/inventory');
          // Shepherd needs a moment for the page to transition
          setTimeout(() => this.next(), 300);
        }
      },
    ],
  },
  {
    id: 'add-item',
    title: 'Add Your First Item',
    text: 'Click here to add a new item. You can specify if it\'s a "Component" (raw material) or a "Product" (what you sell).',
    attachTo: { element: '#add-item-button', on: 'bottom' },
     buttons: [
      {
        text: 'Back',
        type: 'back',
      },
      {
        text: 'Next',
        type: 'next',
      },
    ],
  },
   {
    id: 'recipes-step',
    title: 'Go to Recipes',
    text: 'Now, let\'s see how to create recipes for your products.',
     buttons: [
      {
        text: 'Go to Recipes',
        action() {
          router.push('/recipes');
          setTimeout(() => this.next(), 300);
        }
      },
    ],
  },
  {
    id: 'add-recipe',
    title: 'Create a Recipe',
    text: 'Click here to create a new recipe. A recipe links a "Product" to the "Components" needed to make it.',
    attachTo: { element: '#add-recipe-button', on: 'bottom' },
     buttons: [
       {
        text: 'Back',
        type: 'back',
      },
      {
        text: 'Next',
        type: 'next',
      },
    ],
  },
   {
    id: 'sales-step',
    title: 'Go to the Sales Page',
    text: 'Finally, let\'s check out the sales terminal.',
    buttons: [
      {
        text: 'Go to Sales',
        action() {
          router.push('/sales');
          setTimeout(() => this.next(), 300);
        }
      },
    ],
  },
  {
    id: 'sales-pos',
    title: 'Point of Sale (POS)',
    text: 'Here you can sell your "Products". When you complete a sale, the system will automatically deduct the required "Component" quantities from your inventory based on your recipes!',
    attachTo: { element: '#sales-header', on: 'bottom' },
    buttons: [
      {
        text: 'Back',
        type: 'back',
      },
      {
        text: 'Finish Tour',
        type: 'next',
      },
    ]
  }
];


function Tour() {
  const router = useRouter();
  const tour = useContext(ShepherdTourContext);
  const searchParams = useSearchParams();

  const handleTourCompletion = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    // Use replace to remove the 'tour' query param from the URL
    router.replace('/dashboard');
    if (tour?.steps.length) {
      tour.complete();
    }
  }, [router, tour]);
  
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
    const isTouring = searchParams.get('tour') === 'true';

    if (isTouring && !hasCompletedTour && tour) {
        // A hacky way to ensure the tour starts after the page has had a moment to render
        const startTour = () => {
            if (tour.steps.length > 0) {
              tour.start();
            } else {
              const steps = getSteps(router);
              tour.addSteps(steps);
              tour.start();
            }
            tour.on('complete', handleTourCompletion);
            tour.on('cancel', handleTourCompletion);
        }
        setTimeout(startTour, 500);
    }

     return () => {
      if (tour) {
        tour.off('complete', handleTourCompletion);
        tour.off('cancel', handleTourCompletion);
      }
    };

  }, [tour, searchParams, router, handleTourCompletion]);


  return null;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <ShepherdTour tourOptions={tourOptions} steps={[]}>
      <Suspense fallback={null}>
        <Tour/>
      </Suspense>
      {children}
    </ShepherdTour>
  );
}

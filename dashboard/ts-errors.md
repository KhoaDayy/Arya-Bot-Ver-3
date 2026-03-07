src/components/layout/sidebar/index.tsx(13,24): error TS2322: Type '{ children: Element; exitBeforeEnter: true; initial: false; }' is not assignable to type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
  Property 'exitBeforeEnter' does not exist on type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
src/components/ThemeToggle.tsx(28,30): error TS2322: Type '{ children: Element; exitBeforeEnter: true; initial: false; }' is not assignable to type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
  Property 'exitBeforeEnter' does not exist on type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
src/config/example/HomeView.tsx(100,9): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { duration: number; ease: string; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: string; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: string; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: string; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'string' is not assignable to type 'Easing | Easing[] | undefined'.
src/config/example/HomeView.tsx(160,21): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { duration: number; ease: string; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: string; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: string; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: string; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'string' is not assignable to type 'Easing | Easing[] | undefined'.
src/config/example/HomeView.tsx(181,15): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { duration: number; ease: string; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: string; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: string; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: string; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'string' is not assignable to type 'Easing | Easing[] | undefined'.
src/config/features/guild-war/SharedComponents.tsx(37,21): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/_app.tsx(35,28): error TS2322: Type '{ children: Element; exitBeforeEnter: true; }' is not assignable to type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
  Property 'exitBeforeEnter' does not exist on type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
src/pages/guilds/[guild]/club-activity.tsx(349,37): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/club-activity.tsx(350,37): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/club-activity.tsx(351,37): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/club-activity.tsx(352,37): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/club-activity.tsx(462,60): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/gw-members.tsx(556,37): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/gw-members.tsx(557,37): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/gw-members.tsx(558,37): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/gw-members.tsx(559,37): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/gw-members.tsx(665,56): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/index.tsx(99,23): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/index.tsx(100,23): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/index.tsx(101,23): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/index.tsx(102,23): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/index.tsx(109,23): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/index.tsx(131,25): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/guilds/[guild]/index.tsx(140,25): error TS2322: Type '{ hidden: { opacity: number; y: number; }; show: { opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
src/pages/user/features/face-converter.tsx(178,30): error TS2322: Type '{ children: "" | Element; exitBeforeEnter: true; }' is not assignable to type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
  Property 'exitBeforeEnter' does not exist on type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
src/pages/user/features/player-lookup.tsx(221,30): error TS2322: Type '{ children: "" | Element; exitBeforeEnter: true; }' is not assignable to type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
  Property 'exitBeforeEnter' does not exist on type 'IntrinsicAttributes & AnimatePresenceProps & { children?: ReactNode; }'.
src/pages/user/home.tsx(74,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/home.tsx(156,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/home.tsx(173,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/home.tsx(211,25): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/home.tsx(219,33): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/home.tsx(228,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/home.tsx(263,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/profile.tsx(77,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/profile.tsx(147,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/profile.tsx(219,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.
src/pages/user/profile.tsx(244,21): error TS2322: Type '{ hidden: { opacity: number; y: number; scale: number; }; show: { opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }; }' is not assignable to type 'Variants'.
  Property 'show' is incompatible with index signature.
    Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'Variant'.
      Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ opacity: number; y: number; scale: number; transition: { duration: number; ease: number[]; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ duration: number; ease: number[]; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ duration: number; ease: number[]; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ duration: number; ease: number[]; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'ease' are incompatible.
                    Type 'number[]' is not assignable to type 'Easing | Easing[] | undefined'.
                      Type 'number[]' is not assignable to type 'EasingFunction | Easing[]'.
                        Type 'number[]' is not assignable to type 'Easing[]'.
                          Type 'number' is not assignable to type 'Easing'.

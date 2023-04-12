import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'
import { useEffect, useRef } from 'react';
import Typed from 'typed.js';


const AboutSection: React.FC = () => {
  const titleRef = useRef(null)

  useEffect(() => {
    const name = new Typed(titleRef.current, {
      strings: ['Fullstack Developer', 'Backend Developer', 'Weed Smoker', 'Linux Enthusiast', 'Arch Supremacist'],
      typeSpeed: 70,
      backSpeed: 70,
      loop: true
    })

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      // phrase.destroy()
      name.destroy()
    }
  })
  return (
    <div className="relative isolate overflow-hidden px-6 py-12 lg:overflow-visible lg:px-0">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="animated-gradient-text text-4xl lg:max-w-lg">
              <p className="text-lg font-semibold leading-7 text-ctp-lavender">
                Hi, I am an
              </p>
              <span
                ref={titleRef}
                className="mt-2 min-h-[3rem] text-3xl font-bold tracking-tight sm:text-4xl"
              ></span>
              <p className="mt-8 text-xl leading-8 text-ctp-subtext0">
                I am a Full Stack Developer with expertise in various
                technologies and frameworks. I have a passion for creating
                innovative solutions to complex problems and love to learn new
                technologies.
              </p>
            </div>
          </div>
        </div>
        <div className="-ml-12 -mt-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <img
            className="w-[36rem] max-w-none rounded-xl bg-ctp-mantle shadow-xl ring-4 ring-ctp-overlay0 sm:w-[48rem]"
            src="https://cdn.discordapp.com/attachments/1065993964718661702/1095549156409495602/eu_catppuccin.png.png"
            alt=""
          />
        </div>
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="max-w-xl text-base leading-7 text-ctp-subtext1 lg:max-w-lg">
              <h2 className="animated-gradient-text text-2xl font-bold tracking-tight">
                Connect with me
              </h2>
              <ul role="list" className="mt-8 space-y-8">
                <li className="flex gap-x-3">
                  <CloudArrowUpIcon
                    className="mt-1 h-5 w-5 flex-none text-ctp-lavender"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold text-ctp-lavender">
                      Linkedin
                    </strong>
                    <span className="ml-2">
                      Connect with me to know more about my work and experience.
                      Sometimes I post about my projects and other stuff.
                    </span>
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <LockClosedIcon
                    className="mt-1 h-5 w-5 flex-none text-ctp-blue"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold text-ctp-blue">
                      Github
                    </strong>
                    <span className="ml-2">
                      Check out my projects and contributions. I am always
                      working on something, or learning something new.
                    </span>
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ServerIcon
                    className="mt-1 h-5 w-5 flex-none text-ctp-sapphire"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold text-ctp-sapphire">
                      Steam
                    </strong>
                    <span className="ml-2">
                      Add me on Steam to play some games. Even though I dont
                      play much these days, I am always down to some fun.
                    </span>
                  </span>
                </li>
              </ul>
              <p className="mt-8">
                Et vitae blandit facilisi magna lacus commodo. Vitae sapien duis
                odio id et. Id blandit molestie auctor fermentum dignissim.
                Lacus diam tincidunt ac cursus in vel. Mauris varius vulputate
                et ultrices hac adipiscing egestas. Iaculis convallis ac tempor
                et ut. Ac lorem vel integer orci.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default AboutSection

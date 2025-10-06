'use client';
import React, { useEffect, useState, useRef} from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from 'next/image';
import supabase from "@/helper/supabaseClient";
import { useRouter } from 'next/navigation';
// Import your assets here. Make sure the paths are correct.
import dashboardImg from '@/screen/LandingPage/assets/images/home/dashboard.png';
// import googleLogo from '@/screen/LandingPage/assets/images/brand-logos/google.svg';
// import microsoftLogo from '@/screen/LandingPage/assets/images/brand-logos/microsoft.svg';
// import adobeLogo from '@/screen/LandingPage/assets/images/brand-logos/adobe.svg';
// import airbnbLogo from '@/screen/LandingPage/assets/images/brand-logos/airbnb.svg';
// import stripeLogo from '@/screen/LandingPage/assets/images/brand-logos/stripe.svg';
import insightsImg from '@/screen/LandingPage/assets/images/home/insights.png';
// import womenImg from '@/screen/LandingPage/assets/images/people/women.jpg';
import manImg from '@/screen/LandingPage/assets/images/people/man.jpg';
// import man2Img from '@/screen/LandingPage/assets/images/people/man2.jpg';



// Import the necessary CSS files
import '@/screen/LandingPage/LandingPage.scss';

const LandingPage = () => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);
    const userMenuRef = useRef(null);
    const [currentUserName, setCurrentUserName] = useState(null);
    const [currentUserAvatar, setCurrentUserAvatar] = useState(null); 
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const router = useRouter();

    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    

    useEffect(() => {
        // Use gsap.context() for proper setup and cleanup
        const ctx = gsap.context(() => {
            gsap.registerPlugin(ScrollTrigger);

            // --- HEADER LOGIC (No changes needed here) ---
            const RESPONSIVE_WIDTH = 1024;
            const collapseBtn = document.getElementById("collapse-btn");
            const collapseHeaderItems = document.getElementById("collapsed-header-items");
            
            const onHeaderClickOutside = (e) => {
                if (collapseHeaderItems && !collapseHeaderItems.contains(e.target) && e.target !== collapseBtn) {
                    toggleHeader();
                }
            };

            const toggleHeader = () => {
                if (!collapseHeaderItems || !collapseBtn) return;
                const isOpen = collapseHeaderItems.classList.contains('open');
                if (isOpen) {
                    collapseHeaderItems.classList.remove('open');
                    collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed");
                    collapseBtn.classList.add("bi-list");
                    window.removeEventListener("click", onHeaderClickOutside);
                } else {
                    collapseHeaderItems.classList.add('open');
                    collapseBtn.classList.remove("bi-list");
                    collapseBtn.classList.add("bi-x", "max-lg:tw-fixed");
                    setTimeout(() => window.addEventListener("click", onHeaderClickOutside), 0);
                }
            };
            
            if (collapseBtn) {
                collapseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleHeader();
                });
            }

            // --- GSAP ANIMATIONS ---

            // Dashboard shadow animation
            gsap.to("#dashboard", {
                boxShadow: "0px 15px 25px -5px #7e22ceaa",
                duration: 0.3,
                scrollTrigger: { trigger: "#hero-section", start: "60% 60%", end: "80% 80%" }
            });

            // Dashboard straighten animation
            gsap.to("#dashboard", {
                scale: 1,
                translateY: 0,
                rotateX: "0deg",
                scrollTrigger: {
                    trigger: "#hero-section",
                    start: window.innerWidth > RESPONSIVE_WIDTH ? "top 95%" : "top 70%",
                    end: "bottom bottom",
                    scrub: 1,
                }
            });

            // Section reveal animations
            const sections = gsap.utils.toArray("section");
            sections.forEach((sec) => {
                const revealUpElements = sec.querySelectorAll(".reveal-up");
                gsap.fromTo(revealUpElements, 
                    { y: 50, autoAlpha: 0 },
                    {
                        duration: 1, y: 0, autoAlpha: 1, ease: "power2.out", stagger: 0.2,
                        scrollTrigger: { trigger: sec, start: "top 80%", toggleActions: "play none none reverse" }
                    }
                );
            });
            
            // --- FAQ ACCORDION LOGIC ---
            const faqAccordions = document.querySelectorAll('.faq-accordion');
            const handleAccordionClick = function() {
                this.parentElement.classList.toggle('active');
                let content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    content.style.padding = '0px 18px';
                } else {
                    content.style.maxHeight = content.scrollHeight + 40 + "px";
                    content.style.padding = '20px 18px';
                }
            };
            faqAccordions.forEach(btn => btn.addEventListener('click', handleAccordionClick));
        });

        // Cleanup function
        return () => ctx.revert(); // This automatically cleans up all GSAP animations and ScrollTriggers
    }, []);

    useEffect(() => {
        const fetchAuthUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const user = session?.user;
                if (!user) {
                    setCurrentUserName(null);
                    setCurrentUserAvatar(null); 
                    setIsUserMenuOpen(false);
                    return;
                }

                const metaName = user.user_metadata?.username || user.user_metadata?.full_name || user.user_metadata?.name;
                let finalName = metaName; 

                const { data: profileRow } = await supabase
                    .from('User-Table')
                    .select('user_name, avatar_url') 
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (profileRow) {
                    if (profileRow.user_name) finalName = profileRow.user_name;
                    if (profileRow.avatar_url) setCurrentUserAvatar(profileRow.avatar_url); 
                }

                setCurrentUserName(finalName);

            } catch (err) {
                console.error('Error fetching auth user:', err);
            }
        };

        fetchAuthUser();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchAuthUser();
        });
        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        if (isUserMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setIsUserMenuOpen(false);
            setCurrentUserName(null);
            setCurrentUserAvatar(null); 
            router.refresh?.();
        } catch (e) {
            console.error('Logout error:', e);
        }
    };

        useEffect(() => {
            // --- Menu Closing Logic ---
            const handleClickOutside = (event) => {
                if (
                    menuRef.current &&
                    !menuRef.current.contains(event.target) &&
                    menuButtonRef.current &&
                    !menuButtonRef.current.contains(event.target)
                ) {
                    setIsMenuOpen(false);
                }
            };

            if (isMenuOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            }

            // --- GSAP Animation Setup ---
            const ctx = gsap.context(() => {
                gsap.registerPlugin(ScrollTrigger);
                // (All your GSAP animation code should remain here)
                gsap.to("#dashboard", { /* ... */ });
                gsap.to("#dashboard", { /* ... */ });
                gsap.utils.toArray("section").forEach((sec) => { /* ... */ });
            });

            // --- Cleanup ---
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                ctx.revert();
            };
        }, [isMenuOpen]);


    return (
        <div className='landing-page-container'>
            <div className="tw-flex tw-min-h-[100vh] tw-flex-col tw-bg-black tw-text-white">
              

                <header className="LPheader" id='about'>
                    {/* Logo */}
                    <a className="a logo-container">

                        <Image src="/logo.png" alt="logo" width={40} height={40} />

                        <span className="logo-text">CodeXSync</span>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <a className="a nav-link" href="">About us</a>
                        <a className="a nav-link" href="#features">Features</a>
                        <a className="a nav-link" href="#working">How it works</a>
                        <a className="a nav-link" href="#faq">FAQ</a>
                        <a className="a nav-link" href="/dashboard">Dashboard</a>
                    </nav>

                    {/* Desktop CTA / User Menu */}
                    {currentUserName ? (
                        <div ref={userMenuRef} className="tw-relative">
                            <button
                                aria-label="user"
                                className="desktop-cta-btn"
                                onClick={() => setIsUserMenuOpen((v) => !v)}
                            >
                                {/* MODIFIED: Display Image or Icon */}
                                {currentUserAvatar ? (
                                    <img src={currentUserAvatar} alt="User Avatar" className="tw-w-6 tw-h-6 tw-rounded-full tw-object-cover" style={{ marginRight: '8px', width: '24px', height: '24px', borderRadius: '50%' }} />
                                ) : (
                                    <i className="bi bi-person-circle" style={{ marginRight: '8px' }}></i>
                                )}
                                <span>{currentUserName}</span>
                            </button>
                            {isUserMenuOpen && (
                                <div className="tw-absolute tw-right-0 tw-mt-2 tw-min-w-[180px] tw-rounded-md tw-border tw-border-[#2a2a2a] tw-bg-[#0c0c0c] tw-py-1 tw-shadow-lg">
                                    <a href="/profile" className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2 tw-px-4 tw-py-2 hover:tw-bg-[#1a1a1a]">
                                        <i className="bi bi-person"></i>
                                        <span>View profile</span>
                                    </a>
                                    <button onClick={handleLogout} className="tw-flex tw-w-full tw-cursor-pointer tw-items-center tw-gap-2 tw-px-4 tw-py-2 hover:tw-bg-[#ef4444] hover:tw-text-white">
                                 
                                        <i className="bi bi-box-arrow-right"></i>
                                        <span>Log out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/login" aria-label="signup" className="desktop-cta-btn">
                            <span>Get started</span>
                            <i className="bi bi-arrow-right"></i>
                        </a>
                    )}

                    {/* --- Mobile Elements --- */}
                    <button
                        ref={menuButtonRef} // Add this ref
                        className={`hamburger-btn bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`}
                        aria-label="menu"
                        onClick={toggleMenu}
                    ></button>


                    <div ref={menuRef} className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                        <a className="a nav-link" href="" onClick={toggleMenu}>About us</a>
                        <a className="a nav-link" href="#features" onClick={toggleMenu}>Features</a>
                        <a className="a nav-link" href="#working" onClick={toggleMenu}>How it works</a>
                        <a className="a nav-link" href="#faq" onClick={toggleMenu}>FAQ</a>
                        <a className="a nav-link" href="/dashboard" onClick={toggleMenu}>Dashboard</a>
                        {currentUserName ? (
                            <a href="/dashboard" aria-label="user" className="mobile-cta-btn" onClick={toggleMenu}>
                                {/* MODIFIED: Display Image or Icon in mobile menu */}
                                {currentUserAvatar ? (
                                    <img src={currentUserAvatar} alt="User Avatar" className="tw-w-6 tw-h-6 tw-rounded-full tw-object-cover" style={{ marginRight: '8px', width: '24px', height: '24px', borderRadius: '50%' }} />
                                ) : (
                                    <i className="bi bi-person-circle" style={{ marginRight: '8px' }}></i>
                                )}
                                <span>{currentUserName}</span>
                            </a>
                        ) : (
                            <a href="/login" aria-label="signup" className="mobile-cta-btn" onClick={toggleMenu}>
                                <span>Get started</span>
                            </a>
                        )}
                    </div>
                </header>
                <main>
                    <section className="hero-section tw-relative tw-flex tw-min-h-[100vh] tw-w-full tw-max-w-[100vw] tw-flex-col tw-overflow-hidden max-md:tw-mt-[50px]" id="hero-section">
                        <div className="tw-flex tw-h-full tw-min-h-[100vh] tw-w-full tw-flex-col tw-place-content-center tw-gap-6 tw-p-[5%] max-xl:tw-place-items-center max-lg:tw-p-4">
                            <div className="tw-flex tw-flex-col tw-place-content-center tw-items-center">
                                <div className="reveal-up gradient-text tw-text-center tw-text-6xl tw-font-semibold tw-uppercase tw-leading-[80px] max-lg:tw-text-4xl max-md:tw-leading-snug">
                                    <span>Code Together</span>
                                        <br />
                                    <span>Faster Than Ever.</span>
                                </div>
                                <div className="reveal-up tw-mt-10 tw-max-w-[450px] tw-p-2 tw-text-center tw-text-gray-300 max-lg:tw-max-w-full">
                                    CodeXSync is a real-time collaborative coding environment that lets your team work on the same files, at the same time. No more merge conflicts, no more outdated versions. Just pure, synchronized coding.
                                </div>
                                <div className="reveal-up tw-mt-10 tw-flex tw-place-items-center tw-gap-4">
                                    {currentUserName ? (
                                        <a className="a LPbtn" href="/dashboard">Go to dashboard</a>
                                    ) : (
                                        <a className="a LPbtn" href="/login">Get started</a>
                                    )}
                                </div>
                            </div>
                            <div className="reveal-up tw-relative tw-mt-8 tw-flex tw-w-full tw-place-content-center tw-place-items-center" id="dashboard-container">
                                <div className="tw-relative tw-max-w-[80%] tw-overflow-hidden tw-rounded-xl tw-bg-transparent max-md:tw-max-w-full" id="dashboard">
                                    <Image src={dashboardImg} alt="dashboard" className="tw-h-full tw-w-full tw-object-cover tw-opacity-90 max-lg:tw-object-contain" />
                                </div>
                                <div className="hero-img-bg-grad tw-absolute tw-left-[20%] tw-top-5 tw-h-[200px] tw-w-[200px]"></div>
                            </div>
                        </div>
                    </section>
                    
                    {/* <section className="tw-relative tw-flex tw-w-full tw-max-w-[100vw] tw-flex-col tw-place-content-center tw-place-items-center tw-overflow-hidden tw-p-8">
                        <h2 className="h2 reveal-up tw-text-3xl max-md:tw-text-xl">Trusted by brands you know</h2>
                        <div className="reveal-up carousel-container">
                            <div className="carousel lg:w-place-content-center tw-mt-6 tw-flex tw-w-full tw-gap-5 max-md:tw-gap-2">
                                <div className="carousel-img tw-h-[30px] tw-w-[150px]"><Image src={googleLogo} alt="Google" className="tw-h-full tw-w-full tw-object-contain tw-grayscale tw-transition-colors hover:tw-grayscale-0" /></div>
                                <div className="carousel-img tw-h-[30px] tw-w-[150px]"><Image src={microsoftLogo} alt="Microsoft" className="tw-h-full tw-w-full tw-object-contain tw-grayscale tw-transition-colors hover:tw-grayscale-0" /></div>
                                <div className="carousel-img tw-h-[30px] tw-w-[150px]"><Image src={adobeLogo} alt="Adobe" className="tw-h-full tw-w-full tw-object-contain tw-grayscale tw-transition-colors hover:tw-grayscale-0" /></div>
                                <div className="carousel-img tw-h-[30px] tw-w-[150px]"><Image src={airbnbLogo} alt="Airbnb" className="tw-h-full tw-w-full tw-object-contain tw-grayscale tw-transition-colors hover:tw-grayscale-0" /></div>
                                <div className="carousel-img tw-h-[30px] tw-w-[150px]"><Image src={stripeLogo} alt="Stripe" className="tw-h-full tw-w-full tw-object-contain tw-grayscale tw-transition-colors hover:tw-grayscale-0" /></div>
                            </div>
                        </div>
                    </section> */}

                    <section className="tw-relative tw-flex tw-w-full tw-max-w-[100vw] tw-flex-col tw-place-content-center tw-place-items-center tw-overflow-hidden tw-p-6" id='features'>
                        <div className="tw-mt-8 tw-flex tw-flex-col tw-place-items-center tw-gap-5">
                            <div className="reveal-up tw-mt-5 tw-flex tw-flex-col tw-gap-3 tw-text-center">
                                <h2 className=" h2 tw-text-4xl tw-font-medium tw-text-gray-200 max-md:tw-text-3xl">Key benefits</h2>
                            </div>
                            <div className="tw-mt-6 tw-flex tw-max-w-[80%] tw-flex-wrap tw-place-content-center tw-gap-8 max-lg:tw-flex-col">
                                <div className="reveal-up tw-flex tw-h-[400px] tw-w-[450px] tw-flex-col tw-gap-3 tw-text-center max-md:tw-w-[320px]">
                                    <div className="LPborder-gradient tw-h-[200px] tw-w-full tw-overflow-hidden max-md:tw-h-[150px]">
                                        <div className="tw-flex tw-h-full tw-w-full tw-place-content-center tw-place-items-end tw-p-2">
                                            <i className="bi bi-broadcast tw-text-7xl tw-text-gray-200 max-md:tw-text-5xl"></i>
                                        </div>
                                    </div>
                                    <div className="tw-flex tw-flex-col tw-gap-4 tw-p-2">
                                        <h3 className="h3 tw-mt-8 tw-text-2xl tw-font-normal max-md:tw-text-xl">True Real-Time Sync</h3>
                                        <div className="tw-text-gray-300">See every edit, from every teammate, as it happens. Live cursors show you exactly who is working on what, eliminating confusion and overwrites.</div>
                                    </div>
                                </div>
                                <div className="reveal-up tw-flex tw-h-[400px] tw-w-[450px] tw-flex-col tw-gap-3 tw-text-center max-md:tw-w-[320px]">
                                    <div className="LPborder-gradient tw-h-[200px] tw-w-full tw-overflow-hidden max-md:tw-text-[150px]">
                                        <div className="tw-flex tw-h-full tw-w-full tw-place-content-center tw-place-items-end tw-p-2">
                                            <i className="bi bi-cloud-fill tw-text-7xl tw-text-gray-200 max-md:tw-text-5xl"></i>
                                        </div>
                                    </div>
                                    <div className="tw-flex tw-flex-col tw-gap-4 tw-p-2">
                                        <h3 className="h3 tw-mt-8 tw-text-2xl tw-font-normal max-md:tw-text-xl">Your Code, in the Cloud</h3>
                                        <div className="tw-text-gray-300">No more worrying about local storage. All your projects and files are saved securely online, accessible from any machine, anytime.</div>
                                    </div>
                                </div>
                                <div className="reveal-up tw-flex tw-h-[400px] tw-w-[450px] tw-flex-col tw-gap-3 tw-text-center max-md:tw-w-[320px]">
                                    <div className="LPborder-gradient tw-h-[200px] tw-w-full tw-overflow-hidden max-md:tw-h-[150px]">
                                        <div className="tw-flex tw-h-full tw-w-full tw-place-content-center tw-place-items-end tw-p-2">
                                            <i className="bi bi-play-circle-fill tw-text-7xl tw-text-gray-200 max-md:tw-text-5xl"></i>
                                        </div>
                                    </div>
                                    <div className="tw-flex tw-flex-col tw-gap-4 tw-p-2">
                                        <h3 className="h3 tw-mt-8 tw-text-2xl tw-font-normal max-md:tw-text-xl">Run & Test Instantly</h3>
                                        <div className="tw-text-gray-300">No need to switch to a terminal or a separate environment. Run your code and see the output directly within the editor to iterate and debug at lightning speed.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section className="tw-relative tw-flex tw-min-h-[80vh] tw-w-full tw-max-w-[100vw] tw-flex-col tw-place-content-center tw-place-items-center tw-overflow-hidden tw-p-6">
                        <div className="tw-mt-8 tw-flex tw-flex-col tw-place-items-center tw-gap-5">
                            <div className="reveal-up tw-mt-5 tw-flex tw-flex-col tw-gap-3 tw-text-center">
                                <h2 className="h2 tw-text-4xl tw-font-medium tw-text-gray-200 max-md:tw-text-2xl">Features loved by everyone</h2>
                            </div>
                            <div className="tw-mt-6 tw-flex tw-max-w-[80%] tw-flex-wrap tw-place-content-center tw-gap-8 max-lg:tw-flex-col">
                                <div className="reveal-up tw-flex tw-h-[200px] tw-w-[450px] tw-gap-8 tw-rounded-xl tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-8 max-md:tw-w-[320px]">
                                    <div className="tw-text-4xl max-md:tw-text-2xl"><i className="bi bi-cursor-fill"></i></div>
                                    <div className="tw-flex tw-flex-col tw-gap-4">
                                        <h3 className="h3 tw-text-2xl max-md:tw-text-xl">Real-Time Cursors</h3>
                                        <p className="p tw-text-gray-300 max-md:tw-text-sm">See exactly what your teammates are typing, line by line. It’s like pair programming, but for the whole team.</p>
                                    </div>
                                </div>
                                <div className="reveal-up tw-flex tw-h-[200px] tw-w-[450px] tw-gap-8 tw-rounded-xl tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-8 max-md:tw-w-[320px]">
                                    <div className="tw-text-4xl max-md:tw-text-2xl"><i className="bi bi-folder2-open"></i></div>
                                    <div className="tw-flex tw-flex-col tw-gap-4">
                                        <h3 className="h3 tw-text-2xl max-md:tw-text-xl">Project-Based Workflow</h3>
                                        <p className="p tw-text-gray-300 max-md:tw-text-sm">Organize your work logically. Each project is a dedicated folder where you can create and manage multiple files with ease.</p>
                                    </div>
                                </div>
                                <div className="reveal-up tw-flex tw-h-[200px] tw-w-[450px] tw-gap-8 tw-rounded-xl tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-8 max-md:tw-w-[320px]">
                                    <div className="tw-text-4xl max-md:tw-text-2xl"><i className="bi bi-box-arrow-in-down"></i></div>
                                    <div className="tw-flex tw-flex-col tw-gap-4">
                                        <h3 className="h3 tw-text-2xl max-md:tw-text-xl">Effortless Import/Export</h3>

                                        <p className="p tw-text-gray-300 max-md:tw-text-sm">Bring your existing code into CodeXSync with a simple import, and export your entire project when you&apos;re ready to deploy.</p>

                                    </div>
                                </div>
                                <div className="reveal-up tw-flex tw-h-[200px] tw-w-[450px] tw-gap-8 tw-rounded-xl tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-8 max-md:tw-w-[320px]">
                                    <div className="tw-text-4xl max-md:tw-text-2xl"><i className="bi bi-people-fill"></i></div>
                                    <div className="tw-flex tw-flex-col tw-gap-4">
                                        <h3 className="h3 tw-text-2xl max-md:tw-text-xl">Solo & Team Modes</h3>

                                        <p className="p tw-text-gray-300 max-md:tw-text-sm">Perfect for team sprints and solo projects alike. Collaborate when you need to, and fly solo when you don&apos;t.</p>

                                    </div>
                                </div>
                                <div className="reveal-up tw-flex tw-h-[200px] tw-w-[450px] tw-gap-8 tw-rounded-xl tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-8 max-md:tw-w-[320px]">
                                    <div className="tw-text-4xl max-md:tw-text-2xl"><i className="bi bi-code-slash"></i></div>
                                    <div className="tw-flex tw-flex-col tw-gap-4">
                                        <h3 className="h3 tw-text-2xl max-md:tw-text-xl">Multi-Language Support</h3>
                                        <p className="p tw-text-gray-300 max-md:tw-text-sm">From Java to JavaScript, our online runner supports a wide variety of languages and frameworks.</p>
                                    </div>
                                </div>
                                <div className="reveal-up tw-flex tw-h-[200px] tw-w-[450px] tw-gap-8 tw-rounded-xl tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-8 max-md:tw-w-[320px]">
                                    <div className="tw-text-4xl max-md:tw-text-2xl"><i className="bi bi-terminal-fill"></i></div>
                                    <div className="tw-flex tw-flex-col tw-gap-4">
                                        <h3 className="h3 tw-text-2xl max-md:tw-text-xl">Integrated Output Section</h3>
                                        <p className="p tw-text-sm tw-text-gray-300">No need to leave the editor and open a terminal to install packages, manage dependencies, and compile.Get output with just a click alongside your code.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                    <section className="tw-relative tw-flex tw-min-h-[80vh] tw-w-full tw-max-w-[100vw] tw-flex-col tw-place-content-center tw-place-items-center tw-overflow-hidden tw-p-6" id='working'>
                        <div className="reveal-up tw-flex tw-min-h-[60vh] tw-place-content-center tw-place-items-center tw-gap-[10%] max-lg:tw-flex-col max-lg:tw-gap-10">
                            <div className="tw-flex">
                                <div className="tw-max-h-[650px] tw-max-w-[850px] tw-overflow-hidden tw-rounded-lg tw-shadow-lg tw-shadow-[rgba(170,49,233,0.44021358543417366)]">
                                    <Image src={insightsImg} alt="coding" className="tw-h-full tw-w-full tw-object-cover" />
                                </div>
                            </div>
                            <div className="tw-mt-6 tw-flex tw-max-w-[450px] tw-flex-col tw-gap-4">
                                <h3 className="h3 tw-text-4xl tw-font-medium max-md:tw-text-2xl">How It Works?</h3>
                                <div className="tw-mt-4 tw-flex tw-flex-col tw-gap-3">
                                    <h4 className="h4 tw-text-xl tw-font-medium">1.Create Your Project</h4>

                                    <span className="tw-text-lg tw-text-gray-300 max-md:tw-text-base">Start a new project with a single click. It&apos;s your dedicated, cloud-based folder, ready for you to add and manage all your code files.</span>
                                </div>
                                <div className="tw-mt-4 tw-flex tw-flex-col tw-gap-3">
                                    <h4 className="h4 tw-text-xl tw-font-medium">2.Add Your Team by Email</h4>
                                    <span className="tw-text-lg tw-text-gray-300 max-md:tw-text-base">As the project owner, you have full control. Simply add your teammates by their email address to grant them secure access to the codebase.</span>
                                </div>
                                <div className="tw-mt-4 tw-flex tw-flex-col tw-gap-3">
                                    <h4 className="h4 tw-text-xl tw-font-medium">3.Code & Collaborate Live</h4>

                                    <span className="tw-text-lg tw-text-gray-300 max-md:tw-text-base">Start coding from scratch in our powerful editor. Run your code instantly and watch your team&apos;s cursors fly as you build your next great project together, in perfect sync.</span>

                                </div>
                            </div>
                            
                        </div>
                    </section>

                    {/* <section className="tw-mt-5 tw-flex tw-min-h-[80vh] tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-p-[2%]">
                        <h3 className="h3 tw-text-4xl tw-font-medium tw-text-gray-200 max-md:tw-text-2xl">Meet the developers and founders</h3>
                        <div className="tw-mt-8 tw-gap-10 tw-space-y-8 max-md:tw-columns-1 lg:tw-columns-2 xl:tw-columns-2">
                            <div className="reveal-up tw-flex tw-h-fit tw-w-[350px] tw-break-inside-avoid tw-flex-col tw-gap-4 tw-rounded-lg tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-4 max-lg:tw-w-[320px]">
                                <p className="p tw-mt-4 tw-text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore deserunt delectus consectetur enim cupiditate ab nemo voluptas repellendus qui quas..</p>
                                <div className="tw-flex tw-place-items-center tw-gap-3">
                                    <div className="tw-h-[50px] tw-w-[50px] tw-overflow-hidden tw-rounded-full"><Image src={manImg} className="tw-h-full tw-w-full tw-object-cover" alt="man" /></div>
                                    <div className="tw-flex tw-flex-col tw-gap-1"><div className="tw-font-semibold">Pranay Solanki</div><div className="tw-text-gray-400">Co-Founder</div></div>
                                </div>
                            </div>
                            <div className="reveal-up tw-flex tw-h-fit tw-w-[350px] tw-break-inside-avoid tw-flex-col tw-gap-4 tw-rounded-lg tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-4 max-lg:tw-w-[320px]">
                                <p className="p tw-mt-4 tw-text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore deserunt delectus consectetur enim cupiditate ab nemo voluptas repellendus qui quas..</p>
                                <div className="tw-flex tw-place-items-center tw-gap-3">
                                    <div className="tw-h-[50px] tw-w-[50px] tw-overflow-hidden tw-rounded-full"><Image src={manImg} className="tw-h-full tw-w-full tw-object-cover" alt="man" /></div>
                                    <div className="tw-flex tw-flex-col tw-gap-1"><div className="tw-font-semibold">Siddhi Vejare</div><div className="tw-text-gray-400">Co-Founder</div></div>
                                </div>
                            </div>
                            <div className="reveal-up tw-flex tw-h-fit tw-w-[350px] tw-break-inside-avoid tw-flex-col tw-gap-4 tw-rounded-lg tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-4 max-lg:tw-w-[320px]">
                                <p className="p tw-mt-4 tw-text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore deserunt delectus consectetur enim cupiditate ab nemo voluptas repellendus qui quas..</p>
                                <div className="tw-flex tw-place-items-center tw-gap-3">
                                    <div className="tw-h-[50px] tw-w-[50px] tw-overflow-hidden tw-rounded-full"><Image src={manImg} className="tw-h-full tw-w-full tw-object-cover" alt="man" /></div>
                                    <div className="tw-flex tw-flex-col tw-gap-1"><div className="tw-font-semibold">Shivang Varma</div><div className="tw-text-gray-400">Co-Founder</div></div>
                                </div>
                            </div>
                            <div className="reveal-up tw-flex tw-h-fit tw-w-[350px] tw-break-inside-avoid tw-flex-col tw-gap-4 tw-rounded-lg tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-4 max-lg:tw-w-[320px]">
                                <p className="p tw-mt-4 tw-text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore deserunt delectus consectetur enim cupiditate ab nemo voluptas repellendus qui quas..</p>
                                <div className="tw-flex tw-place-items-center tw-gap-3">
                                    <div className="tw-h-[50px] tw-w-[50px] tw-overflow-hidden tw-rounded-full"><Image src={manImg} className="tw-h-full tw-w-full tw-object-cover" alt="man" /></div>
                                    <div className="tw-flex tw-flex-col tw-gap-1"><div className="tw-font-semibold">Maulik Zambad</div><div className="tw-text-gray-400">Co-Founder</div></div>
                                </div>
                            </div>
                        </div>
                    </section> */}

                    {/* <section className="tw-mt-5 tw-flex tw-w-full tw-flex-col tw-place-items-center tw-p-[2%]" id="pricing">
                        <h3 className="h3 tw-text-3xl tw-font-medium tw-text-gray-300 max-md:tw-text-2xl">Simple pricing</h3>
                        <div className="tw-mt-10 tw-flex tw-flex-wrap tw-place-content-center tw-gap-8 max-lg:tw-flex-col">
                            <div className="reveal-up tw-flex tw-w-[380px] tw-flex-col tw-place-items-center tw-gap-2 tw-rounded-lg tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-8 tw-shadow-xl max-lg:tw-w-[320px]">
                                <h3><span className="h3 tw-text-5xl tw-font-semibold">$9</span><span className="tw-text-2xl tw-text-gray-400">/mo</span></h3>
                                <p className="p tw-mt-3 tw-text-center tw-text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, explicabo!</p><hr className="hr"/>
                                <ul className="ul tw-mt-4 tw-flex tw-flex-col tw-gap-2 tw-text-center tw-text-lg tw-text-gray-200">
                                    <li>Lorem ipsum dolor sit amet.</li><li>Lorem, ipsum.</li><li>Lorem, ipsum dolor.</li><li>Lorem ipsum dolor sit.</li>
                                </ul>
                                <a href="http://" className="a LPbtn !tw-w-full tw-transition-transform tw-duration-[0.3s] hover:tw-scale-x-[1.02]">Get now</a>
                            </div>
                            <div className="reveal-up tw-flex tw-w-[380px] tw-flex-col tw-place-items-center tw-gap-2 tw-rounded-lg tw-border-2 tw-border-primary tw-bg-secondary tw-p-8 tw-shadow-xl max-lg:tw-w-[320px]">
                                <h3><span className="h3 tw-text-5xl tw-font-semibold">$19</span><span className="tw-text-2xl tw-text-gray-400">/mo</span></h3>
                                <p className="p tw-mt-3 tw-text-center tw-text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, explicabo!</p><hr className="hr"/>
                                <ul className="ul tw-mt-4 tw-flex tw-flex-col tw-gap-2 tw-text-center tw-text-lg tw-text-gray-200">
                                    <li>Lorem ipsum dolor sit amet.</li><li>Lorem, ipsum.</li><li>Lorem, ipsum dolor.</li><li>Lorem ipsum dolor sit.</li>
                                </ul>
                                <a href="http://" className="a LPbtn !tw-w-full tw-transition-transform tw-duration-[0.3s] hover:tw-scale-x-[1.02]">Get now</a>
                            </div>
                            <div className="reveal-up tw-flex tw-w-[380px] tw-flex-col tw-place-items-center tw-gap-2 tw-rounded-lg tw-border-[1px] tw-border-outlineColor tw-bg-secondary tw-p-8 tw-shadow-xl max-lg:tw-w-[320px]">
                                <h3><span className="h3 tw-text-5xl tw-font-semibold">$49</span><span className="tw-text-2xl tw-text-gray-400">/mo</span></h3>
                                <p className="p tw-mt-3 tw-text-center tw-text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, explicabo!</p><hr className="hr" />
                                <ul className="ul tw-mt-4 tw-flex tw-flex-col tw-gap-2 tw-text-center tw-text-lg tw-text-gray-200">
                                    <li>Lorem ipsum dolor sit amet.</li><li>Lorem, ipsum.</li><li>Lorem, ipsum dolor.</li><li>Lorem ipsum dolor sit.</li>
                                </ul>
                                <a href="http://" className="a LPbtn !tw-w-full tw-transition-transform tw-duration-[0.3s] hover:tw-scale-x-[1.02]">Get now</a>
                            </div>
                        </div>
                    </section> */}

                    <section className="tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-gap-[10%] tw-p-[5%] tw-px-[10%]" id='faq'>
                        <h3 className="h3 tw-text-4xl tw-font-medium tw-text-gray-300 max-md:tw-text-2xl">FAQ</h3>
                        <div className="tw-mt-5 tw-flex tw-min-h-[300px] tw-w-full tw-max-w-[850px] tw-flex-col tw-gap-4">
                            <div className="faq tw-w-full tw-rounded-md tw-border-[1px] tw-border-solid tw-border-[#1F2123] tw-bg-[#080808]">
                                <div className="faq-accordion tw-flex tw-w-full tw-select-none tw-text-xl max-md:tw-text-lg">
                                    <span>How do I start a project?</span><i className="bi bi-plus tw-ml-auto tw-font-semibold"></i>
                                </div>
                                <div className="content">You can create a new, empty project right from your dashboard. From there, you can create as many files as you need.</div>
                            </div>
                            <div className="faq tw-w-full tw-rounded-md tw-border-[1px] tw-border-solid tw-border-[#1F2123] tw-bg-[#080808]">
                                <div className="faq-accordion tw-flex tw-w-full tw-select-none tw-text-xl max-md:tw-text-lg">
                                    <span>How does sharing work?</span><i className="bi bi-plus tw-ml-auto tw-font-semibold"></i>
                                </div>
                                <div className="content">The project creator can invite collaborators by entering their email addresses in the project settings. This ensures your code remains secure and accessible only to your team.</div>
                            </div>
                            <div className="faq tw-w-full tw-rounded-md tw-border-[1px] tw-border-solid tw-border-[#1F2123] tw-bg-[#080808]">
                                <div className="faq-accordion tw-flex tw-w-full tw-select-none tw-text-xl max-md:tw-text-lg">
                                    <span>Can I use my existing code?</span><i className="bi bi-plus tw-ml-auto tw-font-semibold"></i>
                                </div>

                                <div className="content">Yes. While you can&apos;t upload a whole project at once, you can easily import the code from any local file directly into our editor. Just create a new file in your project and select the &apos;Import&apos; option.</div>

                            </div>
                            <div className="faq tw-w-full tw-rounded-md tw-border-[1px] tw-border-solid tw-border-[#1F2123] tw-bg-[#080808]">
                                <div className="faq-accordion tw-flex tw-w-full tw-select-none tw-text-xl max-md:tw-text-lg">
                                    <span>Is my code secure?</span><i className="bi bi-plus tw-ml-auto tw-font-semibold"></i>
                                </div>
                                <div className="content">Absolutely. Your projects are stored securely in the cloud. Access is strictly controlled by the project owner through email invitations, so only your designated team can view or edit the code.</div>
                            </div>
                            <div className="faq tw-w-full tw-rounded-md tw-border-[1px] tw-border-solid tw-border-[#1F2123] tw-bg-[#080808]">
                                <div className="faq-accordion tw-flex tw-w-full tw-select-none tw-text-xl max-md:tw-text-lg">
                                    <span>Can I work alone?</span><i className="bi bi-plus tw-ml-auto tw-font-semibold"></i>
                                </div>
                                <div className="content">Absolutely! CodeXSync is a powerful solo coding environment, too. You get all the benefits of a cloud-based editor—like online storage and an integrated runner—without ever needing to invite a team.</div>
                            </div>
                        </div>
                        <div className="tw-mt-20 tw-flex tw-flex-col tw-place-items-center tw-gap-4">
                            <div className="tw-text-3xl max-md:tw-text-2xl">Still have questions?</div>
                            <a href="" className="a LPbtn !tw-rounded-full !tw-border-[1px] !tw-border-solid !tw-border-gray-300 !tw-bg-transparent tw-transition-colors tw-duration-[0.3s]">Contact</a>
                        </div>
                    </section>
                </main>

                <footer className="tw-mt-auto tw-flex tw-w-full tw-place-content-around tw-gap-3 tw-p-[5%] tw-px-[10%] tw-text-white max-md:tw-flex-col">
                    <div className="tw-flex tw-h-full tw-w-[250px] tw-flex-col tw-place-items-center tw-gap-6 max-md:tw-w-full">

                        <Image src="/logo.png" alt="logo" width={120} height={120} />

                        <div>Mumbai,India</div>
                        
                    </div>
                    {/* <div className="tw-flex tw-h-full tw-w-[250px] tw-flex-col tw-gap-4">
                        <h2 className="h2 tw-text-3xl max-md:tw-text-xl">Company</h2>
                        <div className="tw-flex tw-flex-col tw-gap-3 max-md:tw-text-sm">
                            <a href="#/" className="a footer-link">Use cases</a><a href="#/" className="a footer-link">Integrations</a>
                            <a href="#/" className="a footer-link">Change logs</a><a href="#/" className="a footer-link">Blogs</a><a href="#/" className="a footer-link">Contact</a>
                        </div>
                    </div> */}
                    <div className="tw-flex tw-h-full tw-w-[250px] tw-flex-col tw-gap-4">
                        <h2 className="h2 tw-text-3xl max-md:tw-text-xl">Resources</h2>
                        <div className="tw-flex tw-flex-col tw-gap-3 max-md:tw-text-sm">
                            <a href="#about" className="a footer-link">About us</a><a href="#faq" className="a footer-link">FAQ</a>
                            <a href="#/" className="a footer-link">Contact Us</a><a href="#/" className="a footer-link">Terms & Conditions</a><a href="#/" className="a footer-link">Privacy policy</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
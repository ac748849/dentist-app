'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-vandevoorde.png"
                alt="Sarah Vandevoorde Cabinet Dentaire"
                width={200}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-gray-700 hover:text-teal-600 transition font-medium">
                Accueil
              </a>
              <a href="#services" className="text-gray-700 hover:text-teal-600 transition font-medium">
                Services
              </a>
              <a href="#equipe" className="text-gray-700 hover:text-teal-600 transition font-medium">
                Notre équipe
              </a>
              <a href="#contact" className="text-gray-700 hover:text-teal-600 transition font-medium">
                Contact
              </a>
              <Link 
                href="/booking"
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Prendre rendez-vous
              </Link>
              <Link
                href="/login"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-teal-600 transition font-medium"
                title="Accès réservé aux dentistes"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Espace Dentiste</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="#accueil" className="text-gray-700 hover:text-teal-600 font-medium">Accueil</a>
                <a href="#services" className="text-gray-700 hover:text-teal-600 font-medium">Services</a>
                <a href="#equipe" className="text-gray-700 hover:text-teal-600 font-medium">Notre équipe</a>
                <a href="#contact" className="text-gray-700 hover:text-teal-600 font-medium">Contact</a>
                <Link href="/booking" className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold text-center">
                  Prendre rendez-vous
                </Link>
                <Link href="/login" className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-teal-500 hover:text-teal-600 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Espace Dentiste</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="pt-32 pb-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <div className="inline-block px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-semibold mb-6">
                ✨ Votre sourire, notre priorité
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Des soins dentaires
                <span className="block text-teal-600">d'excellence</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                À Nalinnes, le Cabinet Dentaire Sarah Vandevoorde vous accueille 
                dans un environnement moderne et chaleureux pour tous vos soins dentaires.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/booking"
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-center"
                >
                  Réserver en ligne
                </Link>
                <a
                  href="tel:+3271491683"
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg font-semibold text-lg hover:border-teal-500 hover:text-teal-600 transition-all duration-200 text-center"
                >
                  📞 071 49 16 83
                </a>
              </div>

              {/* Trust elements */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-1">15+</div>
                  <div className="text-sm text-gray-600">Années d'expérience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-1">3000+</div>
                  <div className="text-sm text-gray-600">Patients satisfaits</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-1">4.9★</div>
                  <div className="text-sm text-gray-600">Note moyenne</div>
                </div>
              </div>
            </div>

            {/* Right image - Photo du cabinet */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl shadow-2xl overflow-hidden">
                <Image
                  src="/cabinet-photo.png"
                  alt="Cabinet Dentaire Sarah Vandevoorde - Vue intérieure"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl border border-gray-100 max-w-xs">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Urgences acceptées</div>
                    <div className="text-sm text-gray-600">Prise en charge rapide</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une gamme complète de soins dentaires pour toute la famille
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                title: 'Consultations & Prévention',
                services: ['Contrôle dentaire', 'Détartrage', 'Première visite'],
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: '✨',
                title: 'Dentisterie Esthétique',
                services: ['Blanchiment', 'Facettes', 'Composite esthétique'],
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: '🦷',
                title: 'Soins Conservateurs',
                services: ['Traitement des caries', 'Dévitalisation', 'Reconstitution'],
                color: 'from-teal-500 to-teal-600'
              },
              {
                icon: '💎',
                title: 'Prothèses Dentaires',
                services: ['Couronnes', 'Bridges', 'Implants dentaires'],
                color: 'from-pink-500 to-pink-600'
              },
              {
                icon: '😊',
                title: 'Orthodontie',
                services: ['Aligneurs invisibles', 'Appareils fixes', 'Suivi orthodontique'],
                color: 'from-orange-500 to-orange-600'
              },
              {
                icon: '👶',
                title: 'Dentisterie Pédiatrique',
                services: ['Soins enfants', 'Prévention', 'Éducation bucco-dentaire'],
                color: 'from-green-500 to-green-600'
              },
            ].map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <ul className="space-y-2">
                  {service.services.map((item, i) => (
                    <li key={i} className="flex items-start text-gray-600">
                      <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/booking"
              className="inline-flex items-center px-8 py-4 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition"
            >
              Voir tous nos tarifs
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-gray-600">
              L'excellence dentaire à Nalinnes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🏥',
                title: 'Équipements modernes',
                description: 'Technologies de pointe pour des soins optimaux'
              },
              {
                icon: '👨‍⚕️',
                title: 'Équipe expérimentée',
                description: 'Dentistes qualifiés et formation continue'
              },
              {
                icon: '💙',
                title: 'Approche humaine',
                description: 'Écoute et respect de vos besoins'
              },
              {
                icon: '📅',
                title: 'Prise de RDV facile',
                description: 'Réservation en ligne 24/7'
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="equipe" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Notre équipe
            </h2>
            <p className="text-xl text-gray-600">
              Des professionnels passionnés à votre service
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Photo du dentiste */}
                <div className="relative">
                  <div className="aspect-square rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                      src="/dentist-photo.png"
                      alt="Dr. Sarah Vandevoorde"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                    <div className="text-3xl">⭐⭐⭐⭐⭐</div>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Dr. Sarah Vandevoorde</h3>
                  <p className="text-teal-600 font-semibold mb-6">Dentiste généraliste & Esthétique</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-teal-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Formation universitaire</div>
                        <div className="text-gray-600">Diplôme en médecine dentaire de l'Université Catholique de Louvain (UCLouvain) - 2017</div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-teal-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Expérience professionnelle</div>
                        <div className="text-gray-600">8 ans de pratique en dentisterie générale et esthétique</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-teal-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Spécialisations</div>
                        <div className="text-gray-600">Implants, Blanchiment, Orthodontie invisible</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-teal-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Langues</div>
                        <div className="text-gray-600">Français, Néerlandais, Anglais</div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/booking"
                    className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition"
                  >
                    Prendre RDV avec Dr. Vandevoorde
                    <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Hours */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nous contacter
            </h2>
            <p className="text-xl text-gray-600">
              À Nalinnes, un cabinet moderne et accessible
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Adresse</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Chemin du Panama 5A<br />
                    6120 Nalinnes, Belgique<br />
                    <span className="text-sm text-teal-600">Parking gratuit disponible</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Téléphone</h3>
                  <p className="text-gray-600">
                    <a href="tel:+3271491683" className="text-teal-600 font-semibold hover:underline text-lg">
                      071 49 16 83
                    </a><br />
                    <span className="text-sm">Lundi - Vendredi : 9h00 - 18h00</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:dentiste.vandevoorde@gmail.com" className="text-teal-600 hover:underline">
                      dentiste.vandevoorde@gmail.com
                    </a><br />
                    <span className="text-sm">Réponse sous 24h</span>
                  </p>
                </div>
              </div>

              {/* Horaires */}
              <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-100">
                <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Horaires d'ouverture
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="font-semibold">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-semibold">9h00 - 13h00</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Dimanche</span>
                    <span>Fermé</span>
                  </div>
                  <div className="pt-2 border-t border-teal-200 text-sm text-teal-600">
                    ⚡ Urgences acceptées sur rendez-vous
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="relative h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2537.8956789123456!2d4.456789!3d50.398765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c22f2b3456789a%3A0x1234567890abcdef!2sChemin%20du%20Panama%205A%2C%206120%20Nalinnes!5e0!3m2!1sfr!2sbe!4v1735201234567!5m2!1sfr!2sbe"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-500 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prenez soin de votre sourire
          </h2>
          <p className="text-xl text-teal-50 mb-10">
            Réservez votre consultation en quelques clics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-10 py-5 bg-white text-teal-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Réserver en ligne
            </Link>
            <a
              href="tel:+3271491683"
              className="px-10 py-5 bg-teal-700 text-white rounded-xl font-bold text-lg hover:bg-teal-800 transition-all duration-300"
            >
              📞 Appeler maintenant
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Cabinet info */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <Image
                  src="/logo-vandevoorde.png"
                  alt="Sarah Vandevoorde Cabinet Dentaire"
                  width={180}
                  height={54}
                  className="h-10 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 mb-4">
                Des soins dentaires de qualité à Nalinnes depuis 2010.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition">
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition">
                  <span className="text-xl">🐦</span>
                </a>
              </div>
            </div>
            
            {/* Quick links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-teal-400 transition">Nos services</a></li>
                <li><a href="#equipe" className="hover:text-teal-400 transition">Notre équipe</a></li>
                <li><a href="#contact" className="hover:text-teal-400 transition">Contact</a></li>
                <li><Link href="/booking" className="hover:text-teal-400 transition">Prendre RDV</Link></li>
                <li><Link href="/login" className="hover:text-teal-400 transition">Espace Dentiste</Link></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="font-bold text-lg mb-4">Informations</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition">Mentions légales</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">CGU</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Protection des données</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Sarah Vandevoorde Cabinet Dentaire. Tous droits réservés.</p>
            <p className="text-sm mt-2">N° INAMI : 1-234567-89-012 | Agréé par l'Ordre des Dentistes de Belgique</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
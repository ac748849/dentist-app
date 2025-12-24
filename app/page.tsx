'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🦷</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DentistApp
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Fonctionnalités
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition font-medium">
                À propos
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Contact
              </a>
              <Link 
                href="/dashboard"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Espace Dentiste
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Prenez rendez-vous
              </span>
              <br />
              <span className="text-gray-900">en quelques clics</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Réservation intelligente, synchronisation Google Calendar et gestion complète 
              de votre cabinet dentaire.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/booking"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center">
                  📅 Prendre rendez-vous
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              >
                👨‍⚕️ Espace Dentiste
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Synchronisation automatique</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>RGPD Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '27', label: 'Types d\'interventions', icon: '🦷' },
              { number: '100%', label: 'Synchronisé', icon: '🔄' },
              { number: '24/7', label: 'Disponible', icon: '⏰' },
              { number: '5★', label: 'Expérience', icon: '⭐' },
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Fonctionnalités
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour la gestion de votre cabinet dentaire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '📅',
                title: 'Réservation intelligente',
                description: 'Formulaire adapté par âge avec calcul automatique des durées pour 27 types d\'interventions.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '🔄',
                title: 'Sync Google Calendar',
                description: 'Synchronisation bidirectionnelle automatique avec votre Google Calendar. Mises à jour en temps réel.',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                icon: '🎨',
                title: 'Codes couleur',
                description: 'Reconnaissance visuelle instantanée avec 9 couleurs selon le type d\'intervention.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🔔',
                title: 'Rappels automatiques',
                description: 'Notifications 24h et 1h avant le rendez-vous directement sur votre téléphone.',
                gradient: 'from-pink-500 to-rose-500'
              },
              {
                icon: '📊',
                title: 'Dashboard complet',
                description: 'Vue d\'ensemble, statistiques, gestion des rendez-vous et calendrier intégré.',
                gradient: 'from-orange-500 to-yellow-500'
              },
              {
                icon: '🔒',
                title: 'Sécurité maximale',
                description: 'Chiffrement AES-256, audit logs RGPD, tokens sécurisés. Vos données sont protégées.',
                gradient: 'from-green-500 to-emerald-500'
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Dr. Marie Martin
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Dentiste généraliste et orthodontiste avec plus de 15 ans d'expérience. 
                Spécialisée dans les soins dentaires modernes et l'orthodontie invisible.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Spécialités', value: 'Dentisterie générale, Orthodontie' },
                  { label: 'Expérience', value: '15+ années' },
                  { label: 'Cabinet', value: 'Bruxelles Centre' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900">{item.label}</div>
                      <div className="text-gray-600">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-indigo-400 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-9xl">👨‍⚕️</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">5.0/5</div>
                    <div className="text-sm text-gray-600">Note patients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600">
              Notre équipe est là pour vous aider
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              {[
                {
                  icon: '📍',
                  title: 'Adresse',
                  content: 'Avenue Louise 123\n1050 Bruxelles, Belgique',
                  gradient: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: '📞',
                  title: 'Téléphone',
                  content: '+32 2 123 45 67\nDu lundi au vendredi : 9h-18h',
                  gradient: 'from-indigo-500 to-purple-500'
                },
                {
                  icon: '✉️',
                  title: 'Email',
                  content: 'contact@dentistapp.be\nRéponse sous 24h',
                  gradient: 'from-purple-500 to-pink-500'
                },
              ].map((info, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${info.gradient} rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{info.title}</h3>
                    <p className="text-gray-600 whitespace-pre-line">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="relative h-96 bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-gray-600 font-medium">Carte interactive</p>
                  <p className="text-sm text-gray-500 mt-2">Google Maps intégration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à simplifier votre gestion ?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Rejoignez les dentistes qui utilisent déjà DentistApp pour gagner du temps
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Réserver maintenant
            <svg className="ml-3 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🦷</span>
                </div>
                <span className="text-xl font-bold">DentistApp</span>
              </div>
              <p className="text-gray-400">
                La solution moderne pour la gestion de votre cabinet dentaire.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#about" className="hover:text-white transition">À propos</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">CGU</a></li>
                <li><a href="#" className="hover:text-white transition">RGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 DentistApp. Tous droits réservés. Made with ❤️ in Brussels</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
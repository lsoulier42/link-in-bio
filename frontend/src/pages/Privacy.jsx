import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
          <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-600 rounded-2xl p-8 mb-8 text-white">
            <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-2">FayeFiore</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Politique de confidentialité</h1>
            <p className="mt-3 text-purple-200 text-sm">Dernière mise à jour : 2 août 2026</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2>1. Responsable du traitement</h2>
            <p>
              La présente politique concerne <strong>FayeFiore</strong>, une application web de type
              Link-in-bio permettant à ses utilisateurs de créer et partager leur page de liens personnalisée.
            </p>
            <p>
              Pour toute question relative à la confidentialité ou aux données personnelles, vous pouvez
              utiliser l'adresse de contact indiquée à la section Contact ci-dessous.
            </p>

            <h2>2. Données que nous pouvons traiter</h2>
            <p>FayeFiore collecte uniquement les données nécessaires au fonctionnement du service :</p>
            <ul>
              <li>Adresse email et mot de passe (hashé) pour l'authentification des administrateurs.</li>
              <li>Informations de profil (nom d'affichage, bio, avatar, liens) fournies volontairement.</li>
              <li>Données de navigation anonymisées (compteur de clics sur les liens).</li>
            </ul>

            <h2>3. Finalités de l'utilisation</h2>
            <ul>
              <li>Permettre la création et la gestion de pages de liens personnalisées.</li>
              <li>Afficher les pages publiques aux visiteurs.</li>
              <li>Fournir des statistiques de clics aux propriétaires de profils.</li>
              <li>Maintenir la sécurité et le bon fonctionnement du service.</li>
            </ul>

            <h2>4. Conservation et sécurité</h2>
            <p>
              Les données sont conservées pendant la durée d'utilisation du service. Les mots de passe
              sont hashés et ne sont jamais stockés en clair. Nous mettons en œuvre des mesures techniques
              raisonnables pour protéger les données.
            </p>

            <h2>5. Vos droits</h2>
            <p>
              Vous disposez de droits d'accès, de rectification, d'effacement et de portabilité
              de vos données. Pour exercer ces droits, contactez-nous à l'adresse ci-dessous.
            </p>

            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="mt-0">Contact</h2>
              <p>
                <strong>Email :</strong>{' '}
                <a href="mailto:contact@fayefiore.com">contact@fayefiore.com</a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </div>
    </div>
  );
}

<?php

namespace App\Repository;

use App\Entity\Profile;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Profile>
 */
class ProfileRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Profile::class);
    }

    public function findBySlugWithLinks(string $slug): ?Profile
    {
        return $this->createQueryBuilder('p')
            ->addSelect('l')
            ->addSelect('c')
            ->leftJoin('p.links', 'l')
            ->leftJoin('p.categories', 'c')
            ->where('p.slug = :slug')
            ->setParameter('slug', $slug)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return Profile[] */
    public function findAllPublic(): array
    {
        return $this->createQueryBuilder('p')
            ->addSelect('l')
            ->addSelect('c')
            ->leftJoin('p.links', 'l')
            ->leftJoin('p.categories', 'c')
            ->addOrderBy('p.displayName', 'ASC')
            ->getQuery()
            ->getResult();
    }
}

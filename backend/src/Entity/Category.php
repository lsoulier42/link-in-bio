<?php

namespace App\Entity;

use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Profile::class, inversedBy: 'categories')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Profile $profile = null;

    #[ORM\Column(length: 128)]
    private ?string $name = null;

    #[ORM\Column(type: 'integer')]
    private int $position = 0;

    /** @var Collection<int, Link> */
    #[ORM\OneToMany(targetEntity: Link::class, mappedBy: 'category')]
    private Collection $links;

    public function __construct()
    {
        $this->links = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getProfile(): ?Profile { return $this->profile; }
    public function setProfile(?Profile $profile): static { $this->profile = $profile; return $this; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getPosition(): int { return $this->position; }
    public function setPosition(int $position): static { $this->position = $position; return $this; }

    /** @return Collection<int, Link> */
    public function getLinks(): Collection { return $this->links; }
}

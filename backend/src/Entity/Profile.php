<?php

namespace App\Entity;

use App\Repository\ProfileRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProfileRepository::class)]
class Profile
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'profiles')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 64, unique: true)]
    private ?string $slug = null;

    #[ORM\Column(length: 128)]
    private ?string $displayName = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $bio = null;

    #[ORM\Column(length: 512, nullable: true)]
    private ?string $avatarUrl = null;

    #[ORM\Column(length: 32, options: ['default' => 'dark'])]
    private string $themeName = 'dark';

    #[ORM\Column(length: 512, nullable: true)]
    private ?string $backgroundUrl = null;

    #[ORM\Column(type: 'smallint', options: ['default' => 60])]
    private int $backgroundOverlay = 60;

    #[ORM\Column(length: 16, options: ['default' => 'cover'])]
    private string $backgroundSize = 'cover';

    #[ORM\Column(length: 16, options: ['default' => 'center'])]
    private string $backgroundPosition = 'center';

    #[ORM\Column(length: 9, nullable: true)]
    private ?string $nameColor = null;

    #[ORM\Column(length: 9, nullable: true)]
    private ?string $bioColor = null;

    #[ORM\Column(length: 9, nullable: true)]
    private ?string $categoryColor = null;

    #[ORM\Column(length: 32, nullable: true)]
    private ?string $nameFont = null;

    #[ORM\Column(length: 32, nullable: true)]
    private ?string $bioFont = null;

    #[ORM\Column(length: 32, nullable: true)]
    private ?string $categoryFont = null;

    /** @var Collection<int, Link> */
    #[ORM\OneToMany(targetEntity: Link::class, mappedBy: 'profile', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    private Collection $links;

    /** @var Collection<int, Category> */
    #[ORM\OneToMany(targetEntity: Category::class, mappedBy: 'profile', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    private Collection $categories;

    public function __construct()
    {
        $this->links = new ArrayCollection();
        $this->categories = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getSlug(): ?string { return $this->slug; }
    public function setSlug(string $slug): static { $this->slug = $slug; return $this; }

    public function getDisplayName(): ?string { return $this->displayName; }
    public function setDisplayName(string $displayName): static { $this->displayName = $displayName; return $this; }

    public function getBio(): ?string { return $this->bio; }
    public function setBio(?string $bio): static { $this->bio = $bio; return $this; }

    public function getAvatarUrl(): ?string { return $this->avatarUrl; }
    public function setAvatarUrl(?string $avatarUrl): static { $this->avatarUrl = $avatarUrl; return $this; }

    public function getThemeName(): string { return $this->themeName; }
    public function setThemeName(string $themeName): static { $this->themeName = $themeName; return $this; }

    public function getBackgroundUrl(): ?string { return $this->backgroundUrl; }
    public function setBackgroundUrl(?string $backgroundUrl): static { $this->backgroundUrl = $backgroundUrl; return $this; }

    public function getBackgroundOverlay(): int { return $this->backgroundOverlay; }
    public function setBackgroundOverlay(int $backgroundOverlay): static { $this->backgroundOverlay = $backgroundOverlay; return $this; }

    public function getBackgroundSize(): string { return $this->backgroundSize; }
    public function setBackgroundSize(string $backgroundSize): static { $this->backgroundSize = $backgroundSize; return $this; }

    public function getBackgroundPosition(): string { return $this->backgroundPosition; }
    public function setBackgroundPosition(string $backgroundPosition): static { $this->backgroundPosition = $backgroundPosition; return $this; }

    public function getNameColor(): ?string { return $this->nameColor; }
    public function setNameColor(?string $nameColor): static { $this->nameColor = $nameColor; return $this; }

    public function getBioColor(): ?string { return $this->bioColor; }
    public function setBioColor(?string $bioColor): static { $this->bioColor = $bioColor; return $this; }

    public function getCategoryColor(): ?string { return $this->categoryColor; }
    public function setCategoryColor(?string $categoryColor): static { $this->categoryColor = $categoryColor; return $this; }

    public function getNameFont(): ?string { return $this->nameFont; }
    public function setNameFont(?string $nameFont): static { $this->nameFont = $nameFont; return $this; }

    public function getBioFont(): ?string { return $this->bioFont; }
    public function setBioFont(?string $bioFont): static { $this->bioFont = $bioFont; return $this; }

    public function getCategoryFont(): ?string { return $this->categoryFont; }
    public function setCategoryFont(?string $categoryFont): static { $this->categoryFont = $categoryFont; return $this; }

    /** @return Collection<int, Link> */
    public function getLinks(): Collection { return $this->links; }

    public function addLink(Link $link): static
    {
        if (!$this->links->contains($link)) {
            $this->links->add($link);
            $link->setProfile($this);
        }
        return $this;
    }

    public function removeLink(Link $link): static
    {
        if ($this->links->removeElement($link)) {
            if ($link->getProfile() === $this) {
                $link->setProfile(null);
            }
        }
        return $this;
    }

    /** @return Collection<int, Category> */
    public function getCategories(): Collection { return $this->categories; }

    public function addCategory(Category $category): static
    {
        if (!$this->categories->contains($category)) {
            $this->categories->add($category);
            $category->setProfile($this);
        }
        return $this;
    }

    public function removeCategory(Category $category): static
    {
        if ($this->categories->removeElement($category)) {
            if ($category->getProfile() === $this) {
                $category->setProfile(null);
            }
        }
        return $this;
    }
}

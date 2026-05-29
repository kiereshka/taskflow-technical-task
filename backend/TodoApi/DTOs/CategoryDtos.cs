using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public class CategoryResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
}

public class CategoryCreateDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}

public class CategoryUpdateDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}
